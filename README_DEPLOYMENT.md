# Quick Deployment Checklist

## Before You Start
- [ ] Push your code to GitHub
- [ ] Set up MongoDB Atlas account
- [ ] Set up Cloudinary account (for file uploads)
- [ ] Have your JWT secrets ready

## Backend Deployment (Render)
1. [ ] Go to [render.com](https://render.com) and sign up
2. [ ] Create new Web Service from GitHub repo
3. [ ] Set Root Directory to `backend`
4. [ ] Add environment variables (see DEPLOYMENT_GUIDE.md)
5. [ ] Deploy and note the backend URL

## Frontend Deployment (Vercel)
1. [ ] Go to [vercel.com](https://vercel.com) and sign up
2. [ ] Import GitHub repository
3. [ ] Set Root Directory to `frontend`
4. [ ] Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. [ ] Deploy and note the frontend URL

## Final Steps
1. [ ] Update backend `FRONTEND_URL` with your Vercel URL
2. [ ] Redeploy backend
3. [ ] Test the application

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
