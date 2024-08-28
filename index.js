import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());

// Load JSON data
const carsFilePath = path.join(__dirname, 'cars.json');
let cars = JSON.parse(fs.readFileSync(carsFilePath, 'utf-8'));

// Fetch all cars
app.get('/api/cars', (req, res) => {
    res.json(cars);
});

// Add a new car
app.post('/api/cars', (req, res) => {
    const newCar = req.body;
    cars.push(newCar);
    fs.writeFileSync(carsFilePath, JSON.stringify(cars, null, 2));
    res.status(201).json(newCar);
});

// Update a car
app.patch('/api/cars/:reg_number', (req, res) => {
    const { reg_number } = req.params;
    const updatedData = req.body;
    let car = cars.find(car => car.reg_number === reg_number);

    if (car) {
        car = { ...car, ...updatedData };
        cars = cars.map(c => c.reg_number === reg_number ? car : c);
        fs.writeFileSync(carsFilePath, JSON.stringify(cars, null, 2));
        res.json(car);
    } else {
        res.status(404).send('Car not found');
    }
});

// Delete a car
app.delete('/api/cars/:reg_number', (req, res) => {
    const { reg_number } = req.params;
    const initialLength = cars.length;
    cars = cars.filter(car => car.reg_number !== reg_number);

    if (cars.length < initialLength) {
        fs.writeFileSync(carsFilePath, JSON.stringify(cars, null, 2));
        res.status(200).send('Car deleted');
    } else {
        res.status(404).send('Car not found');
    }
});
///
app.get('/api/popularcar', (req, res) => {
    const popularCars = getPopularCars();
    res.json(popularCars);
});

// Function to get popular cars
function getPopularCars() {
    const Cars = {};
    cars.forEach(car => {
      Cars[car.make] = 0;
    });
    cars.forEach(car => {
      Cars[car.make]++;
    });
    let count = 0;
    let PopularCar = '';
    for (const car in Cars) {
      const current = Cars[car];
      if (current > count) {
        count = current;
        PopularCar = car;
      }
    }
    return PopularCar;
  }



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
