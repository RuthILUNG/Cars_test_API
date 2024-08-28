import { assert } from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('Car Management', () => {
    let carManager;

    // Mocking the axios instance
    const mock = new MockAdapter(axios);

    // Dummy data for tests
    const carData = [
        { color: 'Red', make: 'Toyota', model: 'Corolla', reg_number: 'ABC123' },
        { color: 'Blue', make: 'Ford', model: 'Focus', reg_number: 'DEF456' }
    ];

    beforeEach(() => {
        // Initialize the carManager with mock data
        carManager = {
            cars: [],
            newCar: { color: '', make: '', model: '', reg_number: '' },
            updateCar: { color: '', model: '', reg_number: '' },
            deleteCar: { reg_number: '' },
            fetchCars: function() {
                return axios.get('http://localhost:3000/api/cars')
                    .then(response => {
                        this.cars = response.data;
                    });
            },
            addCar: function() {
                return axios.post('http://localhost:3000/api/cars', this.newCar)
                    .then(response => {
                        if (response.status === 201) {
                            this.newCar = { color: '', make: '', model: '', reg_number: '' };
                            return this.fetchCars();
                        }
                    });
            },
            updateCarDetails: function() {
                return axios.patch(`http://localhost:3000/api/cars/${this.updateCar.reg_number}`, {
                    color: this.updateCar.color,
                    model: this.updateCar.model
                })
                .then(response => {
                    if (response.status === 200) {
                        this.updateCar = { color: '', model: '', reg_number: '' };
                        return this.fetchCars();
                    }
                });
            },
            deleteCarDetails: function() {
                return axios.delete(`http://localhost:3000/api/cars/${this.deleteCar.reg_number}`)
                    .then(response => {
                        if (response.status === 200) {
                            this.deleteCar = { reg_number: '' };
                            return this.fetchCars();
                        }
                    });
            }
        };
    });

    it('should fetch cars successfully', (done) => {
        mock.onGet('http://localhost:3000/api/cars').reply(200, carData);

        carManager.fetchCars().then(() => {
            assert.deepEqual(carManager.cars, carData, 'Fetched cars should match the mock data');
            done();
        }).catch(done);
    });

    it('should add a new car successfully', (done) => {
        const newCar = { color: 'Green', make: 'Honda', model: 'Civic', reg_number: 'GHI789' };
        carManager.newCar = newCar;

        mock.onPost('http://localhost:3000/api/cars', newCar).reply(201);
        mock.onGet('http://localhost:3000/api/cars').reply(200, [...carData, newCar]);

        carManager.addCar().then(() => {
            assert.includeDeepMembers(carManager.cars, [newCar], 'The new car should be included in the cars list');
            done();
        }).catch(done);
    });

    it('should update an existing car successfully', (done) => {
        const updatedCar = { reg_number: 'ABC123', color: 'Yellow', model: 'Corolla' };
        carManager.updateCar = updatedCar;

        mock.onPatch(`http://localhost:3000/api/cars/${updatedCar.reg_number}`, {
            color: updatedCar.color,
            model: updatedCar.model
        }).reply(200);

        const updatedCarData = carData.map(car => 
            car.reg_number === updatedCar.reg_number ? { ...car, ...updatedCar } : car
        );
        mock.onGet('http://localhost:3000/api/cars').reply(200, updatedCarData);

        carManager.updateCarDetails().then(() => {
            assert.includeDeepMembers(carManager.cars, [{ ...carData[0], ...updatedCar }], 'The updated car should reflect the changes');
            done();
        }).catch(done);
    });

    it('should delete an existing car successfully', (done) => {
        const carToDelete = { reg_number: 'DEF456' };
        carManager.deleteCar = carToDelete;

        mock.onDelete(`http://localhost:3000/api/cars/${carToDelete.reg_number}`).reply(200);
        mock.onGet('http://localhost:3000/api/cars').reply(200, carData.filter(car => car.reg_number !== carToDelete.reg_number));

        carManager.deleteCarDetails().then(() => {
            assert.notIncludeDeepMembers(carManager.cars, [carToDelete], 'The deleted car should no longer be in the cars list');
            done();
        }).catch(done);
    });
});
