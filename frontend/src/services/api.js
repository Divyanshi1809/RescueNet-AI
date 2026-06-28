// API service layer for RescueNet-AI
// Handles communication with Spring Boot backend at port 8089 with automatic local mock storage fallback.

import * as mockSeeds from '../components/MockData';

const BASE_URL = 'http://localhost:8089/api';

// Initialize localStorage with seed data if not present
const initLocalStorage = () => {
  const seeds = {
    users: mockSeeds.initialUsers,
    disasters: mockSeeds.initialDisasters,
    volunteers: mockSeeds.initialVolunteers,
    ngos: mockSeeds.initialNgos,
    resources: mockSeeds.initialResources,
    shelters: mockSeeds.initialShelters,
    emergencyRequests: mockSeeds.initialEmergencyRequests,
    notifications: mockSeeds.initialNotifications,
    logs: mockSeeds.initialAuditLogs
  };

  Object.entries(seeds).forEach(([key, val]) => {
    if (!localStorage.getItem(`rescuenet_${key}`)) {
      localStorage.setItem(`rescuenet_${key}`, JSON.stringify(val));
    }
  });

  if (!localStorage.getItem('rescuenet_mode')) {
    localStorage.setItem('rescuenet_mode', 'DEMO'); // default to DEMO mode for high stability
  }
};

initLocalStorage();

// Helper to get raw storage items
const getLocal = (key) => JSON.parse(localStorage.getItem(`rescuenet_${key}`));
const setLocal = (key, data) => localStorage.setItem(`rescuenet_${key}`, JSON.stringify(data));

export const getMode = () => localStorage.getItem('rescuenet_mode');
export const setMode = (mode) => localStorage.setItem('rescuenet_mode', mode);

// Auth Token Helpers
export const getToken = () => localStorage.getItem('rescuenet_token');
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('rescuenet_token', token);
  } else {
    localStorage.removeItem('rescuenet_token');
  }
};
export const getActiveUser = () => {
  const user = localStorage.getItem('rescuenet_active_user');
  return user ? JSON.parse(user) : null;
};
export const setActiveUser = (user) => {
  if (user) {
    localStorage.setItem('rescuenet_active_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('rescuenet_active_user');
  }
};

// Generic request helper with JWT header
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }
  return json; // Matches ApiResponse<T> DTO structure: { success, message, data }
}

// Check if server is reachable
export async function pingServer() {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    // If it reaches, it returns 400 bad request (since body is empty), but it means it's running!
    return res.status !== 404;
  } catch (e) {
    return false;
  }
}

// Log a system action locally or in backend
export async function logAction(username, action) {
  const newLog = {
    id: Date.now(),
    user: username || 'anonymous',
    action,
    ipAddress: '127.0.0.1',
    timestamp: new Date().toISOString()
  };

  const logs = getLocal('logs');
  logs.unshift(newLog);
  setLocal('logs', logs);
}

// ==========================================
// API ENDPOINTS WRAPPERS
// ==========================================

export const api = {
  auth: {
    login: async (usernameOrEmail, password) => {
      const mode = getMode();
      if (mode === 'LIVE') {
        try {
          const res = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ usernameOrEmail, password })
          });
          setToken(res.data.token);
          
          // Get profile details
          const profile = await request('/users/me');
          setActiveUser(profile.data);
          logAction(profile.data.username, "User logged in (LIVE)");
          return { success: true, user: profile.data, message: "Logged in successfully (LIVE)" };
        } catch (err) {
          console.warn("Live login failed, fallback to mock:", err.message);
          throw err;
        }
      } else {
        // Mock Login
        const users = getLocal('users');
        const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && password.length >= 4);
        if (!user) {
          throw new Error("Invalid username/email or password (minimum 4 characters in demo).");
        }
        if (!user.enabled) {
          throw new Error("This account is currently disabled by Admin.");
        }
        setToken("mock-jwt-token-xyz");
        setActiveUser(user);
        logAction(user.username, "User logged in (DEMO)");
        return { success: true, user, message: "Logged in successfully (DEMO Mode)" };
      }
    },

    register: async (username, email, password, phone, role) => {
      const mode = getMode();
      if (mode === 'LIVE') {
        const res = await request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, email, password, phone, role })
        });
        logAction(username, `New account registered as ${role} (LIVE)`);
        return res;
      } else {
        // Mock Register
        const users = getLocal('users');
        if (users.some(u => u.username === username || u.email === email)) {
          throw new Error("Username or Email already exists.");
        }
        const newUser = {
          id: users.length + 1,
          username,
          email,
          phone,
          role,
          enabled: true
        };
        users.push(newUser);
        setLocal('users', users);
        logAction(username, `New account registered as ${role} (DEMO)`);
        return { success: true, data: newUser, message: "User registered successfully (DEMO Mode)" };
      }
    },

    logout: () => {
      const activeUser = getActiveUser();
      if (activeUser) {
        logAction(activeUser.username, "User logged out");
      }
      setToken(null);
      setActiveUser(null);
    }
  },

  users: {
    getAll: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/users');
        return res.data;
      }
      return getLocal('users');
    },
    toggleStatus: async (userId, enabled) => {
      if (getMode() === 'LIVE') {
        const res = await request(`/users/${userId}/status?enabled=${enabled}`, {
          method: 'PUT'
        });
        return res.data;
      }
      const users = getLocal('users');
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx].enabled = enabled;
        setLocal('users', users);
        const admin = getActiveUser();
        logAction(admin?.username, `User status updated: ${users[idx].username} set to ${enabled ? 'Enabled' : 'Disabled'}`);
      }
      return users;
    }
  },

  disasters: {
    getAll: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/disasters');
        return res.data;
      }
      return getLocal('disasters');
    },
    create: async (title, description, location, latitude, longitude, disasterType, severity) => {
      if (getMode() === 'LIVE') {
        const res = await request('/disasters', {
          method: 'POST',
          body: JSON.stringify({ title, description, location, latitude, longitude, disasterType, severity })
        });
        const currentUser = getActiveUser();
        logAction(currentUser?.username, `Reported new disaster: ${title} (LIVE)`);
        return res.data;
      }
      // Mock disaster
      const disasters = getLocal('disasters');
      const newDisaster = {
        id: disasters.length + 1,
        title,
        description,
        location,
        latitude: parseFloat(latitude) || 35.6895,
        longitude: parseFloat(longitude) || 139.6917,
        disasterType,
        severity,
        status: 'PENDING',
        reportedAt: new Date().toISOString()
      };
      disasters.unshift(newDisaster);
      setLocal('disasters', disasters);

      // Create notification
      const notifications = getLocal('notifications');
      notifications.unshift({
        id: Date.now(),
        message: `ALERT: New ${severity} severity ${disasterType} reported at ${location}.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      setLocal('notifications', notifications);

      const currentUser = getActiveUser();
      logAction(currentUser?.username, `Reported new disaster: ${title} (DEMO)`);
      return newDisaster;
    },
    updateStatus: async (id, status) => {
      if (getMode() === 'LIVE') {
        const res = await request(`/disasters/${id}/status?status=${status}`, {
          method: 'PUT'
        });
        return res.data;
      }
      const disasters = getLocal('disasters');
      const idx = disasters.findIndex(d => d.id === id);
      if (idx !== -1) {
        disasters[idx].status = status;
        setLocal('disasters', disasters);
        const currentUser = getActiveUser();
        logAction(currentUser?.username, `Updated disaster #${id} status to ${status}`);
      }
      return disasters;
    }
  },

  resources: {
    getAll: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/resources');
        return res.data;
      }
      return getLocal('resources');
    },
    create: async (name, type, quantity, description, location, shelterId) => {
      if (getMode() === 'LIVE') {
        const res = await request('/resources', {
          method: 'POST',
          body: JSON.stringify({ name, type, quantity, description, location, shelterId, status: 'AVAILABLE' })
        });
        return res.data;
      }
      const resources = getLocal('resources');
      const newResource = {
        id: resources.length + 1,
        name,
        type,
        quantity: parseInt(quantity) || 0,
        description,
        status: 'AVAILABLE',
        location,
        shelterId: shelterId ? parseInt(shelterId) : null
      };
      resources.push(newResource);
      setLocal('resources', resources);
      const currentUser = getActiveUser();
      logAction(currentUser?.username, `Registered resource supplies: ${name} (x${quantity})`);
      return newResource;
    },
    updateQuantity: async (id, quantity) => {
      if (getMode() === 'LIVE') {
        const res = await request(`/resources/${id}/quantity?quantity=${quantity}`, {
          method: 'PUT'
        });
        return res.data;
      }
      const resources = getLocal('resources');
      const idx = resources.findIndex(r => r.id === id);
      if (idx !== -1) {
        resources[idx].quantity = parseInt(quantity);
        if (resources[idx].quantity === 0) {
          resources[idx].status = 'ALLOCATED';
        } else {
          resources[idx].status = 'AVAILABLE';
        }
        setLocal('resources', resources);
        const currentUser = getActiveUser();
        logAction(currentUser?.username, `Updated stock of ${resources[idx].name} to ${quantity}`);
      }
      return resources;
    }
  },

  shelters: {
    getAll: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/shelters');
        return res.data;
      }
      return getLocal('shelters');
    },
    create: async (name, location, capacity, occupiedCapacity, contactInfo, latitude, longitude) => {
      if (getMode() === 'LIVE') {
        const res = await request('/shelters', {
          method: 'POST',
          body: JSON.stringify({ name, location, capacity, occupiedCapacity, contactInfo, latitude, longitude, status: 'ACTIVE' })
        });
        return res.data;
      }
      const shelters = getLocal('shelters');
      const newShelter = {
        id: shelters.length + 1,
        name,
        location,
        capacity: parseInt(capacity) || 100,
        occupiedCapacity: parseInt(occupiedCapacity) || 0,
        status: 'ACTIVE',
        contactInfo,
        latitude: parseFloat(latitude) || 35.6895,
        longitude: parseFloat(longitude) || 139.6917
      };
      shelters.push(newShelter);
      setLocal('shelters', shelters);
      const currentUser = getActiveUser();
      logAction(currentUser?.username, `Registered new shelter location: ${name}`);
      return newShelter;
    },
    updateOccupancy: async (id, occupiedCapacity) => {
      if (getMode() === 'LIVE') {
        const res = await request(`/shelters/${id}/occupancy?occupiedCapacity=${occupiedCapacity}`, {
          method: 'PUT'
        });
        return res.data;
      }
      const shelters = getLocal('shelters');
      const idx = shelters.findIndex(s => s.id === id);
      if (idx !== -1) {
        shelters[idx].occupiedCapacity = parseInt(occupiedCapacity);
        if (shelters[idx].occupiedCapacity >= shelters[idx].capacity) {
          shelters[idx].status = 'FULL';
        } else if (shelters[idx].occupiedCapacity === 0) {
          shelters[idx].status = 'INACTIVE';
        } else {
          shelters[idx].status = 'ACTIVE';
        }
        setLocal('shelters', shelters);
        const currentUser = getActiveUser();
        logAction(currentUser?.username, `Updated shelter '${shelters[idx].name}' occupancy to ${occupiedCapacity}/${shelters[idx].capacity}`);
      }
      return shelters;
    },
    updateStatus: async (id, status) => {
      if (getMode() === 'LIVE') {
        const res = await request(`/shelters/${id}/status?status=${status}`, {
          method: 'PUT'
        });
        return res.data;
      }
      const shelters = getLocal('shelters');
      const idx = shelters.findIndex(s => s.id === id);
      if (idx !== -1) {
        shelters[idx].status = status;
        setLocal('shelters', shelters);
        const currentUser = getActiveUser();
        logAction(currentUser?.username, `Updated shelter '${shelters[idx].name}' status to ${status}`);
      }
      return shelters;
    }
  },

  volunteers: {
    getAll: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/volunteers');
        return res.data;
      }
      return getLocal('volunteers');
    },
    register: async (skills) => {
      const activeUser = getActiveUser();
      if (!activeUser) throw new Error("Must be logged in to register.");

      if (getMode() === 'LIVE') {
        const res = await request(`/volunteers/register?skills=${encodeURIComponent(skills)}`, {
          method: 'POST'
        });
        activeUser.role = 'ROLE_VOLUNTEER';
        setActiveUser(activeUser);
        logAction(activeUser.username, "Registered as emergency volunteer (LIVE)");
        return res.data;
      }

      // Mock registration
      const volunteers = getLocal('volunteers');
      const exists = volunteers.some(v => v.userId === activeUser.id);
      if (exists) throw new Error("You are already registered as a volunteer.");

      const newVol = {
        id: volunteers.length + 1,
        userId: activeUser.id,
        username: activeUser.username,
        skills,
        available: true,
        email: activeUser.email,
        phone: activeUser.phone || "+1 555-9999"
      };
      volunteers.push(newVol);
      setLocal('volunteers', volunteers);

      // Upgrade active user role
      activeUser.role = 'ROLE_VOLUNTEER';
      setActiveUser(activeUser);
      const users = getLocal('users');
      const uIdx = users.findIndex(u => u.id === activeUser.id);
      if (uIdx !== -1) {
        users[uIdx].role = 'ROLE_VOLUNTEER';
        setLocal('users', users);
      }

      logAction(activeUser.username, "Registered as emergency volunteer (DEMO)");
      return newVol;
    },
    updateAvailability: async (id, availability) => {
      if (getMode() === 'LIVE') {
        const res = await request(`/volunteers/${id}/availability?availability=${availability}`, {
          method: 'PUT'
        });
        return res.data;
      }
      const volunteers = getLocal('volunteers');
      const idx = volunteers.findIndex(v => v.id === id);
      if (idx !== -1) {
        volunteers[idx].available = availability;
        setLocal('volunteers', volunteers);
        logAction(volunteers[idx].username, `Set availability status to ${availability ? 'Available' : 'Busy/Offline'}`);
      }
      return volunteers;
    },
    // SOS emergency requests endpoints
    getEmergencyRequests: async () => {
      // Direct mock since this endpoint isn't fully set up on backend or will be simulated
      return getLocal('emergencyRequests');
    },
    createEmergencyRequest: async (requesterName, requesterPhone, location, latitude, longitude, description, severity) => {
      const sosList = getLocal('emergencyRequests');
      const newSOS = {
        id: sosList.length + 1,
        requesterName,
        requesterPhone,
        location,
        latitude: parseFloat(latitude) || 35.6895,
        longitude: parseFloat(longitude) || 139.6917,
        description,
        severity,
        status: 'PENDING',
        assignedVolunteer: null,
        requestedAt: new Date().toISOString()
      };
      sosList.unshift(newSOS);
      setLocal('emergencyRequests', sosList);

      // Notification
      const alerts = getLocal('notifications');
      alerts.unshift({
        id: Date.now(),
        message: `🚨 URGENT SOS: Help request from ${requesterName} at ${location}. Severity: ${severity}!`,
        read: false,
        createdAt: new Date().toISOString()
      });
      setLocal('notifications', alerts);

      logAction('SOS_MODULE', `Created SOS alert for ${requesterName}`);
      return newSOS;
    },
    assignEmergencyRequest: async (requestId, volunteerId) => {
      const sosList = getLocal('emergencyRequests');
      const sIdx = sosList.findIndex(s => s.id === requestId);
      if (sIdx !== -1) {
        const volunteers = getLocal('volunteers');
        const volunteer = volunteers.find(v => v.id === volunteerId);
        
        sosList[sIdx].status = 'ASSIGNED';
        sosList[sIdx].assignedVolunteer = volunteer ? {
          id: volunteer.id,
          username: volunteer.username,
          skills: volunteer.skills,
          phone: volunteer.phone
        } : null;
        
        setLocal('emergencyRequests', sosList);

        const alerts = getLocal('notifications');
        alerts.unshift({
          id: Date.now(),
          message: `Volunteer ${volunteer?.username || 'assigned'} is dispatched to assist ${sosList[sIdx].requesterName}.`,
          read: false,
          createdAt: new Date().toISOString()
        });
        setLocal('notifications', alerts);

        logAction('SOS_MODULE', `Dispatched volunteer ${volunteer?.username} to SOS request #${requestId}`);
      }
      return sosList;
    },
    completeEmergencyRequest: async (requestId) => {
      const sosList = getLocal('emergencyRequests');
      const sIdx = sosList.findIndex(s => s.id === requestId);
      if (sIdx !== -1) {
        sosList[sIdx].status = 'COMPLETED';
        setLocal('emergencyRequests', sosList);

        logAction('SOS_MODULE', `Completed SOS request #${requestId} for ${sosList[sIdx].requesterName}`);
      }
      return sosList;
    }
  },

  ngos: {
    getAll: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/ngos');
        return res.data;
      }
      return getLocal('ngos');
    },
    register: async (name, registrationNumber, contactEmail, focusArea) => {
      const activeUser = getActiveUser();
      if (!activeUser) throw new Error("Must be logged in to register an NGO.");

      if (getMode() === 'LIVE') {
        const res = await request('/ngos/register', {
          method: 'POST',
          body: JSON.stringify({ name, registrationNumber, contactEmail, focusArea })
        });
        activeUser.role = 'ROLE_NGO';
        setActiveUser(activeUser);
        logAction(activeUser.username, `Registered NGO: ${name} (LIVE)`);
        return res.data;
      }

      // Mock
      const ngos = getLocal('ngos');
      if (ngos.some(n => n.registrationNumber === registrationNumber)) {
        throw new Error("NGO registration number already exists.");
      }

      const newNgo = {
        id: ngos.length + 1,
        userId: activeUser.id,
        name,
        registrationNumber,
        contactEmail,
        focusArea
      };
      ngos.push(newNgo);
      setLocal('ngos', ngos);

      // Upgrade role
      activeUser.role = 'ROLE_NGO';
      setActiveUser(activeUser);
      const users = getLocal('users');
      const uIdx = users.findIndex(u => u.id === activeUser.id);
      if (uIdx !== -1) {
        users[uIdx].role = 'ROLE_NGO';
        setLocal('users', users);
      }

      logAction(activeUser.username, `Registered NGO: ${name} (DEMO)`);
      return newNgo;
    }
  },

  notifications: {
    getMy: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/notifications/my');
        return res.data;
      }
      return getLocal('notifications');
    },
    markAsRead: async (id) => {
      if (getMode() === 'LIVE') {
        const res = await request(`/notifications/${id}/read`, {
          method: 'PUT'
        });
        return res.data;
      }
      const notifications = getLocal('notifications');
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx].read = true;
        setLocal('notifications', notifications);
      }
      return notifications;
    }
  },

  analytics: {
    getMetrics: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/analytics/metrics');
        return res.data;
      }
      
      // Calculate mock metrics
      const disasters = getLocal('disasters');
      const volunteers = getLocal('volunteers');
      const shelters = getLocal('shelters');
      const resources = getLocal('resources');
      const sos = getLocal('emergencyRequests');

      const totalDisasters = disasters.length;
      const resolvedDisasters = disasters.filter(d => d.status === 'RESOLVED').length;
      const activeDisasters = totalDisasters - resolvedDisasters;

      const totalVolunteers = volunteers.length;
      const availableVolunteers = volunteers.filter(v => v.available).length;

      const totalCapacity = shelters.reduce((acc, curr) => acc + curr.capacity, 0);
      const occupiedCapacity = shelters.reduce((acc, curr) => acc + curr.occupiedCapacity, 0);

      const pendingEmergencyRequests = sos.filter(s => s.status === 'PENDING').length;

      return {
        activeDisasters,
        resolvedDisasters,
        totalVolunteers,
        availableVolunteers,
        totalCapacity,
        occupiedCapacity,
        pendingEmergencyRequests,
        totalResources: resources.length
      };
    },
    getLogs: async () => {
      if (getMode() === 'LIVE') {
        const res = await request('/analytics/logs');
        return res.data;
      }
      return getLocal('logs');
    }
  }
};
