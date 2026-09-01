import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import api, { getImageUrl } from '../api/axios';
import PageHeader from '../components/PageHeader';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const SRI_LANKA_CENTER = [7.8731, 80.7718];

function ItemsMap() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | lost | found

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('/items');
        setItems(response.data.filter((item) => item.latitude && item.longitude));
      } catch (err) {
        console.error('Error fetching items for map:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const visibleItems = filter === 'all' ? items : items.filter((item) => item.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <PageHeader icon="🗺️" title="Map View" subtitle="Reports that have a pinned location." accent="from-blue-600 to-cyan-500" />

        <div className="flex gap-2">
          {['all', 'lost', 'found'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">Loading map...</div>
        ) : (
          <div
            className="relative z-0 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-black/20"
            style={{ height: '65vh' }}
          >
            <MapContainer center={SRI_LANKA_CENTER} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {visibleItems.map((item) => (
                <Marker key={item._id} position={[item.latitude, item.longitude]}>
                  <Popup>
                    <div className="text-sm">
                      {item.images && item.images.length > 0 && (
                        <img src={getImageUrl(item.images[0])} alt={item.title} className="w-full h-20 object-cover rounded-md mb-1" />
                      )}
                      <p className="font-bold">{item.title}</p>
                      <p className={item.status === 'lost' ? 'text-red-600' : 'text-green-600'}>
                        {item.status === 'lost' ? 'LOST' : 'FOUND'} · {item.category}
                      </p>
                      <p>📍 {item.location}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {!loading && visibleItems.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">No pinned reports to show yet.</p>
        )}
      </div>
    </div>
  );
}

export default ItemsMap;
