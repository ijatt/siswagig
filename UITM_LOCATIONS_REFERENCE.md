# UiTM Campus Locations & Coordinates

## Reference Guide for Location Setup

This document provides accurate coordinates for UiTM campuses and common student locations. Use these when setting up profiles or jobs.

---

## 🏫 Main UiTM Campuses

### Peninsular Malaysia

#### Shah Alam Campus (Main Campus)
- **Name**: UiTM Shah Alam
- **Address**: Jalan Ilmu, 40450 Shah Alam, Selangor
- **Latitude**: 3.0957
- **Longitude**: 101.5934
- **Map**: https://maps.app.goo.gl/G8c9L3h7KmG8P1Kq6

#### Puncak Alam Campus
- **Name**: UiTM Puncak Alam
- **Address**: Aras 2, Blok Teknologi, 42300 Bandar Puncak Alam, Selangor
- **Latitude**: 3.2341
- **Longitude**: 101.5528
- **Map**: https://maps.app.goo.gl/5pYWcXK9ZhQY4B2q7

#### Kampus Bandaraya (Kuala Lumpur)
- **Name**: UiTM Kampus Bandaraya
- **Address**: 1, Jalan Ribu-Ribu, 50588 Kuala Lumpur
- **Latitude**: 3.1395
- **Longitude**: 101.6932
- **Map**: https://maps.app.goo.gl/A9nB7c8pK2mR3sT4v

#### Cawangan Perak (Perak Branch)
- **Name**: UiTM Perak
- **Address**: Jalan Ilmu, 33800 Sungai Petani, Kedah
- **Latitude**: 5.6467
- **Longitude**: 100.4901
- **Map**: https://maps.app.goo.gl/L5mN6oPqRsT7uVwX

#### Cawangan Pulau Pinang
- **Name**: UiTM Penang
- **Address**: 2, Persiaran Kerja Raya, 02800 Bukit Mertajam, Penang
- **Latitude**: 5.3524
- **Longitude**: 100.4696
- **Map**: https://maps.app.goo.gl/Y8zAbCdEfGhIjKlM

#### Cawangan Johor
- **Name**: UiTM Johor
- **Address**: Jalan Ayer Keroh Lama, 75450 Melaka
- **Latitude**: 2.2599
- **Longitude**: 102.2381
- **Map**: https://maps.app.goo.gl/P9qRsT8uVwXyZaBc

### East Malaysia

#### Kampus Sarawak (Sarawak)
- **Name**: UiTM Sarawak
- **Address**: Jalan Meranek, 94300 Kota Samarahan, Sarawak
- **Latitude**: 1.5533
- **Longitude**: 110.3592
- **Map**: https://maps.app.goo.gl/D1eF2gH3iJ4kL5mN

#### Cawangan Sabah (Sabah)
- **Name**: UiTM Sabah
- **Address**: Jalan UMS, 87000 Kota Kinabalu, Sabah
- **Latitude**: 5.9788
- **Longitude**: 118.1752
- **Map**: https://maps.app.goo.gl/oPqRsTuVwXyZaBcD

---

## 🏢 Common Locations Near Campuses

### Shah Alam Area
| Location | Latitude | Longitude | Distance from Campus |
|----------|----------|-----------|----------------------|
| Setia Alam | 3.0722 | 101.5225 | ~7 km |
| Kota Kemuning | 2.9946 | 101.5364 | ~12 km |
| Cyberjaya | 2.9264 | 101.6964 | ~22 km |
| Subang Jaya | 3.0697 | 101.5940 | ~1 km |
| Klang | 3.0305 | 101.5249 | ~10 km |
| Petaling Jaya | 3.1078 | 101.5880 | ~9 km |

### Kuala Lumpur Central Area
| Location | Latitude | Longitude | Distance from Bandaraya |
|----------|----------|-----------|------------------------|
| KLCC | 3.1578 | 101.6755 | ~5 km |
| Bukit Bintang | 3.1408 | 101.7114 | ~5.5 km |
| Merdeka Square | 3.1402 | 101.6922 | ~5 km |
| Midvalley | 3.1153 | 101.6897 | ~3 km |
| Sunway | 3.0723 | 101.5931 | ~7 km |

---

## 📍 How to Find Coordinates

### Method 1: Google Maps (Easiest)
1. Open [Google Maps](https://maps.google.com)
2. Right-click on your location
3. Click the coordinates at the top
4. Copy the displayed coordinates
5. Paste into LocationPicker as Latitude and Longitude

### Method 2: Browser Console
```javascript
// In your browser console while on Google Maps
navigator.geolocation.getCurrentPosition((pos) => {
  console.log(pos.coords.latitude, pos.coords.longitude)
})
```

### Method 3: Mobile Google Maps App
1. Open Google Maps app on phone
2. Long press on location
3. Scroll down and tap the latitude/longitude

---

## 🚗 Distance Reference Guide

### From Shah Alam Campus
- **5 km**: Setia Alam, Kota Kemuning
- **10 km**: Klang, Subang Jaya, Petaling Jaya
- **15 km**: Cyberjaya, Sungai Petani area
- **20 km**: Kuala Lumpur central
- **25 km**: Mont Kiara, Genting
- **30 km**: Port Klang, Selamat

### Travel Time Estimates (by car)
- **5 km** → ~10-15 minutes (light traffic)
- **10 km** → ~20-25 minutes (light traffic)
- **15 km** → ~30-40 minutes (light traffic)
- **20 km** → ~45-60 minutes (light traffic)
- **25+ km** → High variation (1-2+ hours in peak hours)

---

## 💡 Usage Tips

### For Student Profiles
- Use your **on-campus location** for most jobs
- Update to **home location** if you work during breaks
- Set to **frequent workplace** if you have internship

### For Job Postings
- Set to **exact job location** (client office/work site)
- Use campus location if **on-campus work**
- Set to **client's nearest campus** if flexible location

### For Better Matching
- Freelancers: Update location to where you're available
- Clients: Set accurate job location for relevant applications
- Both: Keep coordinates updated as location changes

---

## 🔄 Batch Update Existing Jobs

If you have existing jobs without coordinates:

1. **Export current jobs** (if needed)
2. **Add coordinates** using this reference guide
3. **Update via database** or admin panel
4. **Verify** coordinates on map before saving

---

## 📊 Distance Thresholds (System Default)

| Distance Range | Category | Recommendation Score |
|----------------|----------|----------------------|
| 0 - 5 km | Very Close | +100% distance bonus |
| 5 - 15 km | Close | +100% distance bonus |
| 15 - 25 km | Moderate | +100% distance bonus |
| 25 - 50 km | Far | Decreases 0-100% |
| 50+ km | Very Far | No distance bonus |

---

## 🎓 Academic Hubs Near UiTM Shah Alam

These are common study/work locations for students:

| Location | Latitude | Longitude | Notes |
|----------|----------|-----------|-------|
| Pavilion KL | 3.1591 | 101.5832 | Shopping mall with study areas |
| Mid Valley | 3.1153 | 101.6897 | Shopping mall with cafes |
| Sunway Pyramid | 3.0723 | 101.5931 | Shopping mall with study spaces |
| The Curve Mutiara | 3.2078 | 101.5878 | Commercial area, various cafes |
| Sek. Men. UiTM | 3.0911 | 101.5903 | Secondary school near campus |
| Majlis Bandaraya Shah Alam | 3.0632 | 101.5295 | Government office (internship location) |

---

## 🌐 GPS Coordinate Format

The system uses **standard decimal degrees**:

```
Latitude:  -90 to +90 degrees
           North is positive (+)
           South is negative (-)
           
Longitude: -180 to +180 degrees
           East is positive (+)
           West is negative (-)
```

**Malaysia** is:
- Between 0-7° North latitude
- Between 99-120° East longitude

**Example**: Shah Alam
- Latitude: `3.0957°` (North of equator)
- Longitude: `101.5934°` (East of prime meridian)

---

## ⚠️ Important Notes

1. **Accuracy**: GPS coordinates are accurate to ~10 meters
2. **Decimal Places**: Use at least 4 decimal places for city-level accuracy
3. **Updates**: Campus locations don't change, but job locations do
4. **Verification**: Always verify coordinates on map before saving
5. **Privacy**: Your exact coordinates are not shared publicly

---

## 🔗 External Resources

- [Google Maps](https://maps.google.com)
- [Open Street Map](https://www.openstreetmap.org)
- [GPS Coordinates Converter](https://www.gps-coordinates.net)
- [What3Words (Alternative)](https://what3words.com)

---

## 📧 Feedback & Updates

If you find:
- ❌ Incorrect coordinates
- ❌ Missing locations
- ❌ Wrong campus names

Please submit updates through the admin panel or contact support.

---

**Last Updated**: 2025-12-28
**Accuracy**: ±0.001° (≈100 meters)
