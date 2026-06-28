// Pre-seeded high-fidelity mock data for RescueNet-AI
// Used as fallback when the backend is offline or when in DEMO mode.

export const initialUsers = [
  { id: 1, username: "admin", email: "admin@rescuenet.org", phone: "+1 555-0100", role: "ROLE_ADMIN", enabled: true },
  { id: 2, username: "volunteer_jane", email: "jane.d@gmail.com", phone: "+1 555-0122", role: "ROLE_VOLUNTEER", enabled: true },
  { id: 3, username: "ngo_relief", email: "contact@redcross.org", phone: "+1 555-0199", role: "ROLE_NGO", enabled: true },
  { id: 4, username: "john_citizen", email: "john.doe@yahoo.com", phone: "+1 555-0155", role: "ROLE_USER", enabled: true },
  { id: 5, username: "volunteer_bob", email: "bob.smith@outlook.com", phone: "+1 555-0133", role: "ROLE_VOLUNTEER", enabled: true }
];

export const initialDisasters = [
  {
    id: 1,
    title: "Category 4 Hurricane Flash Floods",
    description: "Severe flooding reported in the coastal areas. Water level rose by 1.5 meters. Critical rescue operations required for trapped families.",
    location: "Coastal Sector A",
    latitude: 35.6895,
    longitude: 139.6917,
    disasterType: "FLOOD",
    severity: "CRITICAL",
    status: "ACTIVE",
    reportedAt: "2026-06-24T08:30:00"
  },
  {
    id: 2,
    title: "Industrial Area Chemical Warehouse Fire",
    description: "A major fire broke out at a packaging plant storage facility. Thick toxic smoke dispersing north. Fire department is on scene.",
    location: "North Industrial Park",
    latitude: 35.7500,
    longitude: 139.7800,
    disasterType: "FIRE",
    severity: "HIGH",
    status: "ACTIVE",
    reportedAt: "2026-06-24T09:15:00"
  },
  {
    id: 3,
    title: "Magnitude 6.2 Earthquake Tremor Damage",
    description: "Minor structural damage reported in downtown high rises. No casualties confirmed, but power grids are unstable.",
    location: "Downtown Core",
    latitude: 35.6528,
    longitude: 139.8394,
    disasterType: "EARTHQUAKE",
    severity: "MEDIUM",
    status: "ACTIVE",
    reportedAt: "2026-06-24T05:00:00"
  },
  {
    id: 4,
    title: "Localized Power Line Fire & Gas Leak",
    description: "Gas pipe punctured during road work. Small fire put out quickly, containment crew is sealing the line.",
    location: "Suburban Zone West",
    latitude: 35.6000,
    longitude: 139.6000,
    disasterType: "FIRE",
    severity: "LOW",
    status: "RESOLVED",
    reportedAt: "2026-06-23T14:20:00"
  }
];

export const initialVolunteers = [
  {
    id: 1,
    userId: 2,
    username: "volunteer_jane",
    skills: "First Aid, Paramedic, Search & Rescue, Water Extraction",
    available: true,
    email: "jane.d@gmail.com",
    phone: "+1 555-0122"
  },
  {
    id: 2,
    userId: 5,
    username: "volunteer_bob",
    skills: "Heavy Vehicle Driver, Debris Clearance, Logistics Support",
    available: false,
    email: "bob.smith@outlook.com",
    phone: "+1 555-0133"
  }
];

export const initialNgos = [
  {
    id: 1,
    userId: 3,
    name: "Red Cross Emergency Response",
    registrationNumber: "NGO-109283-RC",
    contactEmail: "contact@redcross.org",
    focusArea: "Medical Aid, Disaster Relief, Food Distribution"
  }
];

export const initialResources = [
  {
    id: 1,
    name: "Standard Medical Kits",
    type: "MEDICAL",
    quantity: 120,
    description: "Contains trauma dressings, disinfectants, splits, and basic medicines.",
    status: "AVAILABLE",
    location: "Downtown Storage Facility A",
    shelterId: 1
  },
  {
    id: 2,
    name: "Purified Water Packets (5L)",
    type: "WATER",
    quantity: 850,
    description: "Individual emergency drinking water pouches.",
    status: "AVAILABLE",
    location: "NGO Command Depot West",
    shelterId: null
  },
  {
    id: 3,
    name: "Canned Food & MRE Packs",
    type: "FOOD",
    quantity: 450,
    description: "Shelf-stable ready-to-eat meals, high-calorie packs.",
    status: "ALLOCATED",
    location: "Shelter Beta Central Hall",
    shelterId: 2
  },
  {
    id: 4,
    name: "Thermal Blankets & Sleeping Bags",
    type: "BLANKETS",
    quantity: 300,
    description: "Heavy-duty windproof emergency thermal sheets.",
    status: "AVAILABLE",
    location: "NGO Command Depot West",
    shelterId: null
  }
];

export const initialShelters = [
  {
    id: 1,
    name: "Shelter Alpha - Stadium Arena",
    location: "Suburban Zone West",
    capacity: 500,
    occupiedCapacity: 145,
    status: "ACTIVE",
    contactInfo: "Stadium Manager - +1 555-0988",
    latitude: 35.6000,
    longitude: 139.6000
  },
  {
    id: 2,
    name: "Shelter Beta - Municipal High School",
    location: "Coastal Sector A",
    capacity: 200,
    occupiedCapacity: 198,
    status: "FULL",
    contactInfo: "Principal Office - +1 555-0922",
    latitude: 35.6895,
    longitude: 139.6917
  },
  {
    id: 3,
    name: "Shelter Gamma - Community Exhibition Hall",
    location: "North Industrial Park",
    capacity: 150,
    occupiedCapacity: 0,
    status: "ACTIVE",
    contactInfo: "Exhibition Coordinator - +1 555-0777",
    latitude: 35.7500,
    longitude: 139.7800
  }
];

export const initialEmergencyRequests = [
  {
    id: 1,
    requesterName: "Marcus Vance",
    requesterPhone: "+1 555-8910",
    location: "Near Coastal Sector A Pier",
    latitude: 35.6880,
    longitude: 139.6950,
    description: "Basement flood rising. Family of four stuck on the first floor. No electricity.",
    severity: "CRITICAL",
    status: "PENDING",
    assignedVolunteer: null,
    requestedAt: "2026-06-24T11:40:00"
  },
  {
    id: 2,
    requesterName: "Emily Watson",
    requesterPhone: "+1 555-3344",
    location: "Downtown Core - 5th Ave Street Intersection",
    latitude: 35.6540,
    longitude: 139.8410,
    description: "Elderly resident requires immediate insulin cold-storage delivery. Trapped due to elevator outage.",
    severity: "HIGH",
    status: "ASSIGNED",
    assignedVolunteer: {
      id: 1,
      username: "volunteer_jane",
      skills: "First Aid, Paramedic, Search & Rescue, Water Extraction",
      phone: "+1 555-0122"
    },
    requestedAt: "2026-06-24T10:15:00"
  }
];

export const initialNotifications = [
  {
    id: 1,
    message: "CRITICAL ALERT: Flood levels are rising rapidly in Coastal Sector A. Evacuation to Shelter Beta recommended.",
    read: false,
    createdAt: "2026-06-24T11:45:00"
  },
  {
    id: 2,
    message: "New Disaster Event reported: Chemical Warehouse Fire in North Industrial Park. Keep windows closed.",
    read: false,
    createdAt: "2026-06-24T09:16:00"
  },
  {
    id: 3,
    message: "Volunteer assigned successfully to Emergency Request #2 (Emily Watson).",
    read: true,
    createdAt: "2026-06-24T10:16:00"
  }
];

export const initialAuditLogs = [
  { id: 1, user: "admin", action: "User 'volunteer_jane' enabled", ipAddress: "192.168.1.10", timestamp: "2026-06-24T09:00:00" },
  { id: 2, user: "admin", action: "Approved NGO registration: 'Red Cross Response'", ipAddress: "192.168.1.10", timestamp: "2026-06-24T09:05:00" },
  { id: 3, user: "ngo_relief", action: "Registered 120 Medical Kits to database", ipAddress: "192.168.1.51", timestamp: "2026-06-24T09:30:00" },
  { id: 4, user: "volunteer_jane", action: "Accepted SOS emergency response duty", ipAddress: "192.168.1.201", timestamp: "2026-06-24T10:15:00" }
];
