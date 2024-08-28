document.addEventListener("alpine:init", () => {
  Alpine.data('carManager', () => ({
      cars: [],  // Initialize cars as an empty array
      newCar: { color: '', make: '', model: '', reg_number: '' },
      updateCar: { color: '', model: '', reg_number: '' },
      deleteCar: { reg_number: '' },

      init() {
          console.log("CarManager initialized");
          this.fetchCars();
      },

      fetchCars() {
          axios.get('http://localhost:3000/api/cars')
              .then(result => {
                  console.log(result.data);  // Log the response to check its structure
                  if (Array.isArray(result.data)) {
                      this.cars = result.data;
                      this.displayCars();
                  } else {
                      console.error('Unexpected response format');
                  }
              })
              .catch(error => {
                  console.error("Error fetching cars:", error);
              });
      },

      displayCars() {
          const carList = document.getElementById('car-list');
          carList.innerHTML = this.cars.map(car => `
              <div class="car">
                  <div><strong>Color:</strong> ${car.color}</div>
                  <div><strong>Make:</strong> ${car.make}</div>
                  <div><strong>Model:</strong> ${car.model}</div>
                  <div><strong>Registration Number:</strong> ${car.reg_number}</div>
              </div>
          `).join('');
      },

      addCar() {
          axios.post('http://localhost:3000/api/cars', this.newCar)
              .then(response => {
                  if (response.status === 201) {
                      this.newCar = { color: '', make: '', model: '', reg_number: '' };
                      this.fetchCars();  // Refresh the car list
                      alert('Car successfully added!');
                  }
              })
              .catch(error => {
                  console.error('Failed to add car', error);
                  alert('Failed to add car');
              });
      },

      updateCarDetails() {
          axios.patch(`http://localhost:3000/api/cars/${this.updateCar.reg_number}`, {
              color: this.updateCar.color,
              model: this.updateCar.model
          })
          .then(response => {
              if (response.status === 200) {
                  this.updateCar = { color: '', model: '', reg_number: '' };
                  this.fetchCars();  // Refresh the car list
                  alert('Car successfully updated!');
              }
          })
          .catch(error => {
              console.error('Failed to update car', error);
              alert('Failed to update car');
          });
      },

      deleteCarDetails() {
          axios.delete(`http://localhost:3000/api/cars/${this.deleteCar.reg_number}`)
              .then(response => {
                  if (response.status === 200) {
                      this.deleteCar = { reg_number: '' };
                      this.fetchCars();  // Refresh the car list
                      alert('Car successfully deleted!');
                  }
              })
              .catch(error => {
                  console.error('Failed to delete car', error);
                  alert('Failed to delete car');
              });
      },
      fetchPopularCar() {
        axios.get('http://localhost:3000/api/popularcar')
            .then(response => {
                this.popularCar = response.data;  // Set the popular car data
            })
            .catch(error => {
                console.error('Error fetching popular car:', error);
            });
    }
  }));
});
