# 🚨 YOUR SITE IS DEPLOYED BUT DATABASE ISN'T CONNECTED

## **Your Site:** https://olympics-mu.vercel.app

## **Current Status:**
```
❌ HEALTH CHECK: FAILED
🚨 DATABASE NOT CONNECTED!
```

---

# ✅ **THE 2-MINUTE FIX**

## **What You Need to Do:**

### **1. Open This Link:**
**https://vercel.com/dashboard**

### **2. Find Your Project**
Look for `olympics` or `olympics-mu` and **click on it**

### **3. Click Settings → Environment Variables**

### **4. Click "Add New" and enter:**

**Name:**
```
DATABASE_URL
```

**Value:** (copy this ENTIRE line)
```
postgresql://neondb_owner:npg_OBqt1f7RGxQk@ep-broad-bread-aiefh9hx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Environments:** Check ✅ ALL THREE boxes

Click **SAVE**

### **5. Go to Deployments → Click ⋯ → Redeploy**

### **6. Wait 2 Minutes**

### **7. Test It:**
Visit: **https://olympics-mu.vercel.app/api/health**

**Should show:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## **DONE!** 🎉

Once you see "healthy", your site works perfectly:
- ✅ Registration works
- ✅ Leaderboard works  
- ✅ Competitions show
- ✅ Everything functional!

---

## **Need More Help?**

Read: **FIX_DATABASE_NOW.md** (detailed step-by-step with troubleshooting)

---

**Time to fix: 2 minutes**  
**Difficulty: Just copy-paste**  
**Result: Fully working site! 🏆**
