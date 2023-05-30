import { Router } from "express";
import userRoutes from '../controllers/user_controller.mjs'
import bikeRoutes from '../controllers/bike_controller.mjs'

const router = Router()

// route extensions 
// */users/*
router.use('/users',userRoutes)
// */bikes/*
router.use('/bikes',bikeRoutes)


export default router