<template>
  <div class="location-picker">
    <!-- Header -->
    <div class="location-header">
      <h3 class="location-title">Set Your Location</h3>
      <p class="location-subtitle">Help us match you with nearby jobs</p>
    </div>

    <!-- Tabs -->
    <div class="location-tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'detect' }]"
        @click="activeTab = 'detect'"
      >
        <Icon name="lucide:map-pin" size="18" />
        Detect Location
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'manual' }]"
        @click="activeTab = 'manual'"
      >
        <Icon name="lucide:search" size="18" />
        Manual Entry
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Detect Location Tab -->
      <div v-if="activeTab === 'detect'" class="detect-section">
        <button
          v-if="!geoLocation"
          class="detect-btn"
          @click="detectLocation"
          :disabled="isDetecting"
        >
          <Icon v-if="isDetecting" name="lucide:loader" size="18" class="spin" />
          <Icon v-else name="lucide:map-pin" size="18" />
          {{ isDetecting ? 'Detecting...' : 'Detect My Location' }}
        </button>

        <div v-if="geoLocation" class="location-display">
          <div class="location-success">
            <Icon name="lucide:check-circle" size="24" class="success-icon" />
            <div class="success-text">
              <p class="success-title">Location Found</p>
              <p class="success-coords">
                Lat: {{ geoLocation.latitude.toFixed(6) }}, Lon: {{ geoLocation.longitude.toFixed(6) }}
              </p>
            </div>
          </div>
          <input
            v-model="locationName"
            type="text"
            placeholder="e.g., Klang Valley, Shah Alam, Subang"
            class="location-input"
            @input="isLocationSaved = false"
          />
          <button class="save-btn" @click="saveLocation">
            Save Location
          </button>
        </div>

        <div v-if="geoError" class="error-message">
          <Icon name="lucide:alert-circle" size="18" />
          <span>{{ geoError }}</span>
        </div>
      </div>

      <!-- Manual Entry Tab -->
      <div v-if="activeTab === 'manual'" class="manual-section">
        <input
          v-model="manualLocation"
          type="text"
          placeholder="Enter your location (e.g., Shah Alam, Selangor)"
          class="location-input"
        />
        <input
          v-model.number="manualLatitude"
          type="number"
          step="0.000001"
          min="-90"
          max="90"
          placeholder="Latitude"
          class="coordinate-input"
        />
        <input
          v-model.number="manualLongitude"
          type="number"
          step="0.000001"
          min="-180"
          max="180"
          placeholder="Longitude"
          class="coordinate-input"
        />
        <div class="hint">
          <Icon name="lucide:info" size="16" />
          Find coordinates at <a href="https://maps.google.com" target="_blank">Google Maps</a>
        </div>
        <button class="save-btn" @click="saveManualLocation" :disabled="!isManualValid">
          Save Location
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="isLocationSaved" class="success-banner">
      <Icon name="lucide:check" size="18" />
      Location saved successfully!
    </div>

    <!-- Current Location Display -->
    <div v-if="savedLocation" class="current-location">
      <p class="current-label">Current Location</p>
      <p class="current-name">{{ savedLocation }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface LocationData {
  latitude: number
  longitude: number
}

const activeTab = ref<'detect' | 'manual'>('detect')
const isDetecting = ref(false)
const geoError = ref<string | null>(null)
const geoLocation = ref<LocationData | null>(null)
const locationName = ref('')
const isLocationSaved = ref(false)

const manualLocation = ref('')
const manualLatitude = ref<number | null>(null)
const manualLongitude = ref<number | null>(null)

const savedLocation = ref<string | null>(null)

const isManualValid = computed(() => {
  return (
    manualLocation.value.trim() &&
    manualLatitude.value !== null &&
    manualLongitude.value !== null &&
    manualLatitude.value >= -90 &&
    manualLatitude.value <= 90 &&
    manualLongitude.value >= -180 &&
    manualLongitude.value <= 180
  )
})

/**
 * Detect location using browser Geolocation API
 */
const detectLocation = () => {
  geoError.value = null
  isDetecting.value = true

  if (!navigator.geolocation) {
    geoError.value = 'Geolocation is not supported by your browser'
    isDetecting.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      geoLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      isDetecting.value = false
    },
    error => {
      const errorMessages: Record<number, string> = {
        1: 'Permission denied. Please enable location access in your browser settings.',
        2: 'Location information is unavailable.',
        3: 'The request to get user location timed out.'
      }
      geoError.value = errorMessages[error.code] || 'Failed to detect location'
      isDetecting.value = false
    }
  )
}

/**
 * Save detected location
 */
const saveLocation = async () => {
  if (!geoLocation.value || !locationName.value) return

  try {
    const response = await fetch('/api/user/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useMyTokenStore().accessToken}`
      },
      body: JSON.stringify({
        location: locationName.value,
        latitude: geoLocation.value.latitude,
        longitude: geoLocation.value.longitude
      })
    })

    if (!response.ok) throw new Error('Failed to save location')

    savedLocation.value = locationName.value
    isLocationSaved.value = true

    setTimeout(() => {
      isLocationSaved.value = false
    }, 3000)
  } catch (err: any) {
    geoError.value = err.message || 'Failed to save location'
  }
}

/**
 * Save manually entered location
 */
const saveManualLocation = async () => {
  if (!isManualValid.value) return

  try {
    const response = await fetch('/api/user/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location: manualLocation.value,
        latitude: manualLatitude.value,
        longitude: manualLongitude.value
      })
    })

    if (!response.ok) throw new Error('Failed to save location')

    savedLocation.value = manualLocation.value
    isLocationSaved.value = true

    setTimeout(() => {
      isLocationSaved.value = false
    }, 3000)

    // Reset form
    manualLocation.value = ''
    manualLatitude.value = null
    manualLongitude.value = null
    activeTab.value = 'detect'
  } catch (err: any) {
    geoError.value = err.message || 'Failed to save location'
  }
}
</script>

<style scoped lang="css">
.location-picker {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.location-header {
  margin-bottom: 20px;
}

.location-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.location-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.location-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  min-height: 200px;
}

.detect-section,
.manual-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detect-btn:hover:not(:disabled) {
  background: #2563eb;
}

.detect-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.location-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
}

.location-success {
  display: flex;
  align-items: center;
  gap: 12px;
}

.success-icon {
  color: #10b981;
  flex-shrink: 0;
}

.success-text {
  flex: 1;
}

.success-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.success-coords {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0 0;
  font-family: monospace;
}

.location-input,
.coordinate-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.location-input:focus,
.coordinate-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.save-btn {
  padding: 10px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: #065f46;
  font-size: 14px;
  margin-top: 12px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.hint a {
  color: #3b82f6;
  text-decoration: none;
}

.hint a:hover {
  text-decoration: underline;
}

.current-location {
  margin-top: 16px;
  padding: 12px;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
}

.current-label {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
}

.current-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin: 4px 0 0 0;
}

@media (max-width: 640px) {
  .location-picker {
    padding: 16px;
  }

  .location-tabs {
    gap: 4px;
  }

  .tab-btn {
    padding: 10px 12px;
    font-size: 13px;
  }

  .detect-btn,
  .save-btn {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
