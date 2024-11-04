import React, { useEffect, useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './canisters/StreetAnimals';
import './main.css';

const canisterId = 'YOUR_CANISTER_ID'; 
function App() {
  const [animals, setAnimals] = useState([]);
  const [form, setForm] = useState({
    species: '',
    location: '',
    health_status: '',
    needs_help: false,
    photo_url: '',
  });

  const agent = new HttpAgent();

  const streetAnimals = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });

  useEffect(() => {
    fetchAnimals();
    // eslint-disable-next-line
  }, []);

  const fetchAnimals = async () => {
    const allAnimals = await streetAnimals.getAllAnimals();
    setAnimals(allAnimals);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { species, location, health_status, needs_help, photo_url } = form;
    await streetAnimals.reportAnimal(species, location, health_status, needs_help, photo_url);
    fetchAnimals();
    setForm({
      species: '',
      location: '',
      health_status: '',
      needs_help: false,
      photo_url: '',
    });
  };

  const updateStatus = async (id) => {
    const newStatus = prompt('Yeni sağlık durumu girin:');
    const needsHelp = window.confirm('Hayvan yardım mı istiyor?');
    if (newStatus !== null) {
      const success = await streetAnimals.updateAnimalStatus(id, newStatus, needsHelp);
      if (success) {
        fetchAnimals();
      } else {
        alert('Güncelleme başarısız.');
      }
    }
  };

  return (
    <div className="container">
      <h1>Sokak Hayvanları Raporlama</h1>
      
      <form onSubmit={handleSubmit} className="report-form">
        <h2>Yeni Hayvan Raporu</h2>
        <label>
          Tür:
          <input type="text" name="species" value={form.species} onChange={handleChange} required />
        </label>
        <label>
          Lokasyon:
          <input type="text" name="location" value={form.location} onChange={handleChange} required />
        </label>
        <label>
          Sağlık Durumu:
          <input type="text" name="health_status" value={form.health_status} onChange={handleChange} required />
        </label>
        <label>
          Yardım Gerekiyor mu?
          <input type="checkbox" name="needs_help" checked={form.needs_help} onChange={handleChange} />
        </label>
        <label>
          Fotoğraf URL'si:
          <input type="text" name="photo_url" value={form.photo_url} onChange={handleChange} />
        </label>
        <button type="submit">Raporla</button>
      </form>

      <h2>Tüm Hayvan Raporları</h2>
      <div className="animals-list">
        {animals.map((animal) => (
          <div key={animal.id} className="animal-card">
            <img src={animal.photo_url} alt={animal.species} />
            <h3>{animal.species}</h3>
            <p><strong>Lokasyon:</strong> {animal.location}</p>
            <p><strong>Sağlık Durumu:</strong> {animal.health_status}</p>
            <p><strong>Yardım Gerekiyor:</strong> {animal.needs_help ? 'Evet' : 'Hayır'}</p>
            <p><strong>Raporlayan:</strong> {animal.reporter}</p>
            <p><strong>Rapor Tarihi:</strong> {animal.date_reported}</p>
            <button onClick={() => updateStatus(animal.id)}>Durumu Güncelle</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
