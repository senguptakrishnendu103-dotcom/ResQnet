import React, { useState, useMemo } from 'react';
import { 
  Building2, Hotel, Hospital, Tent, Bed, HeartPulse, 
  Phone, MapPin, Search, CheckCircle, ShieldCheck, 
  ArrowRight, Sparkles, User, Users, Calendar, AlertCircle
} from 'lucide-react';

const INITIAL_ENTITIES = [
  {
    id: 'hosp-01',
    name: 'Apex Super-Specialty & Trauma Center',
    type: 'hospital',
    location: 'Sector 5, Salt Lake, Kolkata',
    coords: '22.5804, 88.4326',
    contact: '+91 33 2357 0000',
    totalCapacity: 250,
    availableCapacity: 34,
    icuBedsAvailable: 8,
    oxygenAvailable: true,
    bloodBankAvailable: true,
    status: 'High Readiness',
    amenities: ['24/7 Trauma Unit', 'Cardiac ICU', 'Burn Ward', 'Air Ambulance Pad']
  },
  {
    id: 'hotel-01',
    name: 'Grand Horizon Hotel & Evacuation Suites',
    type: 'hotel',
    location: 'New Town Action Area 1, Kolkata',
    coords: '22.5867, 88.4682',
    contact: '+91 33 6688 1234',
    totalCapacity: 120,
    availableCapacity: 48,
    icuBedsAvailable: 0,
    oxygenAvailable: false,
    bloodBankAvailable: false,
    status: 'Accepting Evacuees',
    amenities: ['Emergency Shelter Wing', 'Free Hot Meals', 'Pet Friendly', 'Power Backup']
  },
  {
    id: 'hosp-02',
    name: 'Apollo Emergency & Pediatric Care',
    type: 'hospital',
    location: 'Canal Circular Road, Phoolbagan',
    coords: '22.5697, 88.3995',
    contact: '+91 33 2320 3040',
    totalCapacity: 180,
    availableCapacity: 19,
    icuBedsAvailable: 4,
    oxygenAvailable: true,
    bloodBankAvailable: true,
    status: 'Surge Capacity Active',
    amenities: ['Pediatric ICU', 'Emergency Triage', 'Dialysis Units']
  },
  {
    id: 'shelter-01',
    name: 'Netaji Stadium Relief & Shelter Camp',
    type: 'shelter',
    location: 'Bidhannagar Sports Complex',
    coords: '22.5714, 88.4120',
    contact: '+91 98300 11223',
    totalCapacity: 400,
    availableCapacity: 145,
    icuBedsAvailable: 0,
    oxygenAvailable: true,
    bloodBankAvailable: false,
    status: 'Open 24/7',
    amenities: ['Water Filtration Units', 'First Aid Station', 'Blankets & Cots', 'Disaster Relief Rations']
  },
  {
    id: 'hotel-02',
    name: 'The Orchid Regency Transit Shelters',
    type: 'hotel',
    location: 'Rajarhat Main Road, Kolkata',
    coords: '22.6189, 88.4552',
    contact: '+91 33 4012 8888',
    totalCapacity: 80,
    availableCapacity: 22,
    icuBedsAvailable: 0,
    oxygenAvailable: false,
    bloodBankAvailable: false,
    status: 'Accepting Evacuees',
    amenities: ['Family Dormitories', 'Disability Access', 'Solar Microgrid']
  },
  {
    id: 'hosp-03',
    name: 'Kolkata District Emergency Care Center',
    type: 'hospital',
    location: 'Park Circus Sector, Kolkata',
    coords: '22.5448, 88.3697',
    contact: '+91 33 2287 5555',
    totalCapacity: 140,
    availableCapacity: 12,
    icuBedsAvailable: 2,
    oxygenAvailable: true,
    bloodBankAvailable: false,
    status: 'Near Capacity',
    amenities: ['Rapid Triage', 'Mobile ICU Unit', 'Orthopedic Surgery']
  }
];

export default function HospitalityHub({ onNavigateToMap }) {
  const [entities, setEntities] = useState(INITIAL_ENTITIES);
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModalEntity, setBookingModalEntity] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', count: 1, notes: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    let totalICU = 0;
    let totalGeneralBeds = 0;
    let totalHotelRooms = 0;
    let totalShelterSpots = 0;

    entities.forEach(e => {
      if (e.type === 'hospital') {
        totalICU += e.icuBedsAvailable || 0;
        totalGeneralBeds += e.availableCapacity || 0;
      } else if (e.type === 'hotel') {
        totalHotelRooms += e.availableCapacity || 0;
      } else if (e.type === 'shelter') {
        totalShelterSpots += e.availableCapacity || 0;
      }
    });

    return { totalICU, totalGeneralBeds, totalHotelRooms, totalShelterSpots };
  }, [entities]);

  // Filtered list
  const filteredEntities = useMemo(() => {
    return entities.filter(item => {
      const matchesType = selectedType === 'ALL' || item.type === selectedType;
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [entities, selectedType, searchQuery]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingModalEntity) return;

    // Deduct 1 available slot in local state
    setEntities(prev => prev.map(ent => {
      if (ent.id === bookingModalEntity.id && ent.availableCapacity > 0) {
        return { ...ent, availableCapacity: ent.availableCapacity - Number(bookingForm.count) };
      }
      return ent;
    }));

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModalEntity(null);
      setBookingForm({ name: '', phone: '', count: 1, notes: '' });
    }, 2000);
  };

  return (
    <div className="hospitality-container animate-fade-in">
      {/* Top Banner */}
      <div className="hospitality-header-banner">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles size={14} />
              Hospitality & Trauma Care Command
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Emergency Bed & Shelter Allocation Grid
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time synchronization of hospital ICU beds, emergency hotel suites, and municipal shelter capacities.
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hospitality-stats-grid">
          <div className="hospitality-stat-card">
            <div className="hospitality-stat-icon bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
              <HeartPulse size={22} />
            </div>
            <div>
              <div className="hospitality-stat-val text-cyan-400">{stats.totalICU}</div>
              <div className="hospitality-stat-lbl">Available ICU Beds</div>
            </div>
          </div>

          <div className="hospitality-stat-card">
            <div className="hospitality-stat-icon bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
              <Hospital size={22} />
            </div>
            <div>
              <div className="hospitality-stat-val text-emerald-400">{stats.totalGeneralBeds}</div>
              <div className="hospitality-stat-lbl">General Hospital Beds</div>
            </div>
          </div>

          <div className="hospitality-stat-card">
            <div className="hospitality-stat-icon bg-amber-950/60 text-amber-400 border border-amber-500/20">
              <Hotel size={22} />
            </div>
            <div>
              <div className="hospitality-stat-val text-amber-400">{stats.totalHotelRooms}</div>
              <div className="hospitality-stat-lbl">Hotel Evacuee Rooms</div>
            </div>
          </div>

          <div className="hospitality-stat-card">
            <div className="hospitality-stat-icon bg-blue-950/60 text-blue-400 border border-blue-500/20">
              <Tent size={22} />
            </div>
            <div>
              <div className="hospitality-stat-val text-blue-400">{stats.totalShelterSpots}</div>
              <div className="hospitality-stat-lbl">Relief Camp Spots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="hospitality-controls-bar">
        {/* Type tabs */}
        <div className="hospitality-type-tabs">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`hospitality-type-btn ${selectedType === 'ALL' ? 'active' : ''}`}
          >
            <Building2 size={15} />
            <span>All Facilities ({entities.length})</span>
          </button>
          <button
            onClick={() => setSelectedType('hospital')}
            className={`hospitality-type-btn ${selectedType === 'hospital' ? 'active' : ''}`}
          >
            <Hospital size={15} />
            <span>Hospitals</span>
          </button>
          <button
            onClick={() => setSelectedType('hotel')}
            className={`hospitality-type-btn ${selectedType === 'hotel' ? 'active' : ''}`}
          >
            <Hotel size={15} />
            <span>Hotels</span>
          </button>
          <button
            onClick={() => setSelectedType('shelter')}
            className={`hospitality-type-btn ${selectedType === 'shelter' ? 'active' : ''}`}
          >
            <Tent size={15} />
            <span>Relief Camps</span>
          </button>
        </div>

        {/* Search input */}
        <div className="hospitality-search-wrap">
          <Search size={16} className="hospitality-search-icon" />
          <input
            type="text"
            placeholder="Search facility name, district, or amenity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="hospitality-search-input"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="hospitality-cards-grid">
        {filteredEntities.map((entity) => {
          const occupancyPercent = Math.round(
            ((entity.totalCapacity - entity.availableCapacity) / entity.totalCapacity) * 100
          );

          return (
            <div key={entity.id} className="hospitality-entity-card">
              <div className="flex flex-col gap-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`entity-badge-type ${entity.type}`}>
                    {entity.type === 'hospital' && <Hospital size={11} />}
                    {entity.type === 'hotel' && <Hotel size={11} />}
                    {entity.type === 'shelter' && <Tent size={11} />}
                    {entity.type.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    {entity.status}
                  </span>
                </div>

                {/* Title and Location */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {entity.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-rose-400 shrink-0" />
                    <span>{entity.location}</span>
                  </p>
                </div>

                {/* Capacity Progress */}
                <div className="entity-capacity-bar-wrap">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">
                      {entity.type === 'hospital' ? 'Available Beds' : 'Available Rooms / Cots'}
                    </span>
                    <span className={entity.availableCapacity > 10 ? 'text-emerald-400' : 'text-amber-400'}>
                      {entity.availableCapacity} / {entity.totalCapacity} Free ({100 - occupancyPercent}%)
                    </span>
                  </div>
                  <div className="entity-capacity-progress">
                    <div 
                      className="entity-capacity-fill bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                {/* ICU / Oxygen Specific badges for hospitals */}
                {entity.type === 'hospital' && (
                  <div className="flex gap-2">
                    <span className="text-[11px] font-bold px-2 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/20">
                      ICU Beds: {entity.icuBedsAvailable}
                    </span>
                    {entity.oxygenAvailable && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
                        Oxygen Ready
                      </span>
                    )}
                    {entity.bloodBankAvailable && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/20">
                        Blood Bank
                      </span>
                    )}
                  </div>
                )}

                {/* Amenities / Features tags */}
                <div className="entity-amenities-tags">
                  {entity.amenities.map((amenity, idx) => (
                    <span key={idx} className="entity-tag-pill">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="entity-card-footer-actions">
                <button
                  type="button"
                  onClick={() => setBookingModalEntity(entity)}
                  className="entity-action-btn-primary"
                >
                  <Bed size={15} />
                  <span>{entity.type === 'hospital' ? 'Admit Patient' : 'Book Evacuee Room'}</span>
                </button>

                <a
                  href={`tel:${entity.contact}`}
                  className="entity-action-btn-call"
                  title="Call Hotline"
                >
                  <Phone size={15} />
                </a>

                {onNavigateToMap && (
                  <button
                    type="button"
                    onClick={() => onNavigateToMap(entity.coords)}
                    className="entity-action-btn-call"
                    title="View on Map"
                  >
                    <MapPin size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reservation / Admission Modal */}
      {bookingModalEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[var(--text-primary)]">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Sparkles size={20} className="text-[var(--accent)]" />
              {bookingModalEntity.type === 'hospital' ? 'Emergency Bed Admission' : 'Evacuee Shelter Reservation'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Direct allocation for <span className="font-bold text-[var(--text-primary)]">{bookingModalEntity.name}</span>
            </p>

            {bookingSuccess ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <CheckCircle size={48} className="text-emerald-500 animate-bounce" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Allocation Confirmed!</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Priority dispatch ticket generated. The facility coordinator has received this dispatch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                    Beneficiary / Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="Full legal name"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.phone}
                      onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="+91..."
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                      {bookingModalEntity.type === 'hospital' ? 'Patients' : 'Guests / Family'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={bookingForm.count}
                      onChange={e => setBookingForm({ ...bookingForm, count: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                    Medical Condition / Special Needs
                  </label>
                  <textarea
                    rows="2"
                    value={bookingForm.notes}
                    onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="E.g. requires oxygen, wheelchair access, burns, etc."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalEntity(null)}
                    className="flex-1 py-2.5 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] font-bold text-xs uppercase hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-[var(--accent)] text-white font-bold text-xs uppercase hover:brightness-110 transition-all shadow-lg"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

