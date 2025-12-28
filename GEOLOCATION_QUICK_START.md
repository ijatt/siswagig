# Geolocation Quick Start Guide

## 🚀 Getting Started with Location-Based Job Matching

### What's New?

SiswaGig now matches jobs based on **both skills AND proximity** to your location. This helps you find jobs closer to you!

---

## 📍 Step 1: Set Your Location

### Option A: Auto-Detect (Recommended)
1. Go to **Profile → Edit Profile**
2. Scroll to **Location & Geolocation** section
3. Click **"Detect My Location"** button
4. Grant location permission when browser asks
5. Enter your location name (e.g., "Shah Alam, Selangor")
6. Click **"Save Location"**

### Option B: Manual Entry
1. Go to **Profile → Edit Profile**
2. Click **"Manual Entry"** tab
3. Enter your location name
4. Find your coordinates at [Google Maps](https://maps.google.com):
   - Right-click on your location
   - Copy the coordinates
   - Paste latitude and longitude
5. Click **"Save Location"**

**Common UiTM Locations**:
| Location | Latitude | Longitude |
|----------|----------|-----------|
| UiTM Shah Alam | 3.0957 | 101.5934 |
| UiTM Puncak Alam | 3.2341 | 101.5528 |
| UiTM Bandaraya | 3.1395 | 101.6932 |
| UiTM Kampus Sarawak | 1.5533 | 110.3592 |

---

## 💼 Step 2: Browse Jobs with Distance Info

### On the Explore Page:
- Toggle **"AI Recommendations"** to ON
- You'll see job cards with:
  - **Skill Match Score** (e.g., "85% match")
  - **Distance Badge** (e.g., "12.5 km")
  - **Match Reasons** (includes proximity info)

### Distance Categories:
- 🟢 **Very Close**: ≤5 km
- 🟢 **Close**: 5-15 km
- 🟡 **Moderate**: 15-30 km
- 🟠 **Far**: 30-50 km
- 🔴 **Very Far**: >50 km

---

## 🔍 Step 3: Filter Jobs by Distance (Advanced)

### Using API Query Parameter:
```
/api/jobs/recommended?maxDistance=25&limit=20
```

This will only show jobs within 25 km of your location.

### Available Endpoints:
```
GET /api/jobs/recommended
  - Standard recommendations with distance
  
GET /api/jobs/match-with-history
  - Advanced recommendations considering your application history + distance
  
Query Parameters:
  ?maxDistance=<km>      - Max distance to consider
  ?minSimilarity=<0-1>   - Minimum skill match score
  ?limit=<number>        - Results limit
```

---

## 📊 How the Matching Algorithm Works

### Skill-Based Score (80%)
- **40%** → Skills matching
- **25%** → Bio/profile matching
- **15%** → Job title relevance

### Location-Based Score (20%)
- **≤25 km** → Full score (100%)
- **25-50 km** → Partial score (decreases linearly)
- **>50 km** → No score (0%)

### Final Score
```
Final Match Score = (Skill Score × 0.8) + (Distance Score × 0.2)
```

**Example**:
- Job A: 90% skill match, 8 km away → (0.9 × 0.8) + (1.0 × 0.2) = **0.92** (92%)
- Job B: 100% skill match, 60 km away → (1.0 × 0.8) + (0.0 × 0.2) = **0.80** (80%)
- Job A ranks higher! ✅

---

## 💡 Tips & Tricks

### For Students (Freelancers)
1. **Set your location** on your campus location for best matches
2. **Update location** if you move or prefer jobs near different areas
3. **Check the distance** before applying to plan travel time
4. **Use maxDistance filter** if you prefer jobs within walking distance

### For Clients (Job Posters)
1. **When creating a job**, make sure to set the job location
2. **Jobs without coordinates** will still be recommended (distance score = neutral)
3. **Future feature**: Filter applicants by distance when accepting applications

---

## ❓ FAQs

### Q: Will my location be public?
**A**: No. Your exact location is only used for matching calculations. Your "location" field (e.g., "Shah Alam") is visible on your profile.

### Q: Can I update my location?
**A**: Yes! Go to Profile → Edit Profile → Location & Geolocation, and update anytime.

### Q: What if a job has no location?
**A**: The job can still be recommended based on skills. Distance is neutral (neither helps nor hurts).

### Q: Why is a perfect skill match job showing lower than another?
**A**: It's probably because the perfect match job is far from you. The algorithm balances both factors.

### Q: How accurate is the distance?
**A**: Uses the **Haversine formula** (same used by GPS). Accurate to ~0.1 km for most cases.

### Q: Can I disable location matching?
**A**: Yes, don't set a location. Jobs will be ranked by skills only (original algorithm).

---

## 🔧 Troubleshooting

### "Detect My Location" not working?
- ✅ Make sure browser asks for location permission
- ✅ Check you're on HTTPS (secure connection)
- ✅ Try **Manual Entry** instead
- ✅ Refresh page and try again

### Distance showing as "Location not available"?
- ✅ Job might not have location set by the client
- ✅ Check your own location is saved
- ✅ Still eligible for recommendations based on skills

### Jobs not showing even though they're nearby?
- ✅ Check skill requirements match your profile
- ✅ Use `/api/jobs/recommended?maxDistance=50` to see further jobs
- ✅ Update your skills in profile

---

## 🎯 Best Practices

### For Optimal Matching:
1. ✅ **Complete your profile** with accurate skills
2. ✅ **Set your location** as accurately as possible
3. ✅ **Write a detailed bio** about your experience
4. ✅ **Update skills regularly** as you learn new ones

### For Best Results:
- Review **nearby jobs first** (they're more convenient)
- Check **match reasons** to understand why a job was recommended
- **Apply to diverse jobs** to get better recommendations over time

---

## 📚 More Information

For technical details, see: [GEOLOCATION_IMPLEMENTATION.md](./GEOLOCATION_IMPLEMENTATION.md)

For feature documentation, see: [JOB_MATCHING_ALGORITHM.md](./JOB_MATCHING_ALGORITHM.md)

---

**Happy job hunting! 🎉**
