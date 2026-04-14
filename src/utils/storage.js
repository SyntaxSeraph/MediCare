
// ============================================
// Generic localStorage helpers
// ============================================

export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// ============================================
// User/Auth helpers
// ============================================

export function getCurrentUser() {
  return getFromStorage('medicare_current_user');
}

export function setCurrentUser(user) {
  saveToStorage('medicare_current_user', user);
}

export function logoutUser() {
  removeFromStorage('medicare_current_user');
}

export function getUsers() {
  return getFromStorage('medicare_users', []);
}

export function registerUser(user) {
  const users = getUsers();
  users.push(user);
  saveToStorage('medicare_users', users);
}

export function findUser(username, password, role) {
  const users = getUsers();
  return users.find(
    (u) => u.username === username && u.password === password && u.role === role
  );
}

// ============================================
// Hospital helpers
// ============================================

export function getHospitals() {
  return getFromStorage('medicare_hospitals', []);
}

export function saveHospitals(hospitals) {
  saveToStorage('medicare_hospitals', hospitals);
}

export function addHospital(hospital) {
  const hospitals = getHospitals();
  hospitals.push(hospital);
  saveHospitals(hospitals);
}

// ============================================
// Appointment helpers
// ============================================

export function getAppointments() {
  return getFromStorage('medicare_appointments', []);
}

export function saveAppointments(appointments) {
  saveToStorage('medicare_appointments', appointments);
}

export function addAppointment(appointment) {
  const appointments = getAppointments();
  appointments.push(appointment);
  saveAppointments(appointments);
}

// ============================================
// Token helpers
// ============================================

export function getTokens() {
  return getFromStorage('medicare_tokens', {});
}

export function saveTokens(tokens) {
  saveToStorage('medicare_tokens', tokens);
}

export function getCurrentToken(hospitalId) {
  const tokens = getTokens();
  return tokens[hospitalId]?.currentToken || 0;
}

export function updateCurrentToken(hospitalId, tokenNumber) {
  const tokens = getTokens();
  if (!tokens[hospitalId]) {
    tokens[hospitalId] = {};
  }
  tokens[hospitalId].currentToken = tokenNumber;
  saveTokens(tokens);
}

export function getNextTokenNumber(hospitalId) {
  const tokens = getTokens();
  if (!tokens[hospitalId]) {
    tokens[hospitalId] = { counter: 0, currentToken: 0 };
  }
  tokens[hospitalId].counter += 1;
  saveTokens(tokens);
  return tokens[hospitalId].counter;
}

// ============================================
// Health Records helpers
// ============================================

export function getHealthRecords(username) {
  return getFromStorage(`medicare_health_${username}`, {
    profile: { name: '', age: '', bloodGroup: '', phone: '', email: '' },
    records: [],
  });
}

export function saveHealthRecords(username, data) {
  saveToStorage(`medicare_health_${username}`, data);
}
