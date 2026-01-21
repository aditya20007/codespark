// Load dynamic data
async function loadData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    renderAbout(data.about);
    renderServices(data.services);
    renderProjects(data.projects);
    renderExperiences(data.experiences);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function renderAbout(about) {
  const aboutSection = document.querySelector('#about .about-content');
  if (aboutSection) {
    aboutSection.innerHTML = `<p>${about}</p>`;
  }
}

function renderServices(services) {
  const servicesSection = document.querySelector('#services .cards');
  if (servicesSection) {
    servicesSection.innerHTML = '';
    const icons = ['fas fa-code', 'fas fa-laptop-code', 'fas fa-database', 'fas fa-cloud', 'fas fa-tachometer-alt', 'fas fa-tools'];
    services.forEach((service, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-aos', 'zoom-in');
      card.setAttribute('data-aos-delay', (index * 100).toString());
      card.innerHTML = `
        <i class="${icons[index] || 'fas fa-code'} fa-3x" style="color: #667eea; margin-bottom: 20px;"></i>
        <h3>${service.title}</h3>
        <p>${service.description}</p>
      `;
      servicesSection.appendChild(card);
    });
  }
}

function renderProjects(projects) {
  const projectsSection = document.querySelector('#projects .cards');
  projectsSection.innerHTML = '';
  projects.forEach((project, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-aos', 'flip-left');
    card.setAttribute('data-aos-delay', (index * 100).toString());
    card.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    `;
    projectsSection.appendChild(card);
  });
}

function renderExperiences(experiences) {
  const experienceSection = document.querySelector('#experience');
  const existingH2 = experienceSection.querySelector('h2');
  experienceSection.innerHTML = '';
  experienceSection.appendChild(existingH2);
  experiences.forEach((exp, index) => {
    const box = document.createElement('div');
    box.className = 'experience-box';
    box.setAttribute('data-aos', index % 2 === 0 ? 'fade-right' : 'fade-left');
    box.innerHTML = `
      <h3>${exp.title}</h3>
      <span>${exp.company}</span>
      <p>${exp.description}</p>
    `;
    experienceSection.appendChild(box);
  });
}

// Authentication
function isLoggedIn() {
  return localStorage.getItem('loggedIn') === 'true';
}

function logout() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Admin link handler
document.addEventListener('DOMContentLoaded', function() {
  const adminLink = document.getElementById('adminLink');
  if (adminLink) {
    adminLink.addEventListener('click', function(e) {
      e.preventDefault();
      const email = prompt('Enter admin email:');
      const password = prompt('Enter admin password:');
      if (email === 'admin@codespark.com' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
      } else {
        alert('Invalid admin credentials');
      }
    });
  }

  // Load data if on index page
  if (document.querySelector('#projects')) {
    loadData();
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = 'admin.html';
      } else {
        alert('Invalid credentials');
      }
    });
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find(u => u.email === email)) {
        alert('User already exists');
        return;
      }
      const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const isAdmin = email === 'admin@codespark.com'; // Predefined admin email
      users.push({ id: uniqueId, name, email, password, isAdmin });
      localStorage.setItem('users', JSON.stringify(users));
      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
    });
  }

  // Admin dashboard
  if (document.querySelector('#adminDashboard')) {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
      alert('Access denied. Admin privileges required.');
      window.location.href = 'index.html';
    } else {
      loadAdminData();
    }
  }
});

function loadAdminData() {
  // Load data for editing
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      renderEditableProjects(data.projects);
      renderEditableExperiences(data.experiences);
    });
}

function renderEditableProjects(projects) {
  const container = document.getElementById('projectsList');
  container.innerHTML = '';
  projects.forEach((project, index) => {
    const div = document.createElement('div');
    div.className = 'editable-item';
    div.innerHTML = `
      <input type="text" value="${project.title}" data-index="${index}" data-field="title">
      <textarea data-index="${index}" data-field="description">${project.description}</textarea>
      <button onclick="updateProject(${index})">Update</button>
      <button onclick="deleteProject(${index})">Delete</button>
    `;
    container.appendChild(div);
  });
}

function renderEditableExperiences(experiences) {
  const container = document.getElementById('experiencesList');
  container.innerHTML = '';
  experiences.forEach((exp, index) => {
    const div = document.createElement('div');
    div.className = 'editable-item';
    div.innerHTML = `
      <input type="text" value="${exp.title}" data-index="${index}" data-field="title">
      <input type="text" value="${exp.company}" data-index="${index}" data-field="company">
      <textarea data-index="${index}" data-field="description">${exp.description}</textarea>
      <button onclick="updateExperience(${index})">Update</button>
      <button onclick="deleteExperience(${index})">Delete</button>
    `;
    container.appendChild(div);
  });
}

function saveChanges() {
  // Collect data from editable items
  const projects = [];
  const projectItems = document.querySelectorAll('#projectsList .editable-item');
  projectItems.forEach(item => {
    const title = item.querySelector('input[data-field="title"]').value;
    const description = item.querySelector('textarea[data-field="description"]').value;
    projects.push({ title, description });
  });

  const experiences = [];
  const expItems = document.querySelectorAll('#experiencesList .editable-item');
  expItems.forEach(item => {
    const title = item.querySelector('input[data-field="title"]').value;
    const company = item.querySelector('input[data-field="company"]').value;
    const description = item.querySelector('textarea[data-field="description"]').value;
    experiences.push({ title, company, description });
  });

  // Save to localStorage (in a real app, send to backend)
  localStorage.setItem('projects', JSON.stringify(projects));
  localStorage.setItem('experiences', JSON.stringify(experiences));
  alert('Changes saved locally!');
}

function deleteProject(index) {
  if (confirm('Are you sure you want to delete this project?')) {
    // Remove from DOM
    const item = document.querySelector(`#projectsList .editable-item:nth-child(${index + 1})`);
    if (item) item.remove();
  }
}

function deleteExperience(index) {
  if (confirm('Are you sure you want to delete this experience?')) {
    // Remove from DOM
    const item = document.querySelector(`#experiencesList .editable-item:nth-child(${index + 1})`);
    if (item) item.remove();
  }
}

function addProject() {
  const container = document.getElementById('projectsList');
  const div = document.createElement('div');
  div.className = 'editable-item';
  div.innerHTML = `
    <input type="text" value="New Project" data-field="title">
    <textarea data-field="description">Project description</textarea>
    <button onclick="deleteProject(${container.children.length})">Delete</button>
  `;
  container.appendChild(div);
}

function addExperience() {
  const container = document.getElementById('experiencesList');
  const div = document.createElement('div');
  div.className = 'editable-item';
  div.innerHTML = `
    <input type="text" value="New Experience" data-field="title">
    <input type="text" value="Company" data-field="company">
    <textarea data-field="description">Experience description</textarea>
    <button onclick="deleteExperience(${container.children.length})">Delete</button>
  `;
  container.appendChild(div);
}

function updateProject(index) {
  // Get current data
  const title = document.querySelector(`#projectsList .editable-item:nth-child(${index + 1}) input[data-field="title"]`).value;
  const description = document.querySelector(`#projectsList .editable-item:nth-child(${index + 1}) textarea[data-field="description"]`).value;
  // Update localStorage
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  if (projects[index]) {
    projects[index] = { title, description };
    localStorage.setItem('projects', JSON.stringify(projects));
    alert('Project updated!');
  }
}

function updateExperience(index) {
  // Get current data
  const title = document.querySelector(`#experiencesList .editable-item:nth-child(${index + 1}) input[data-field="title"]`).value;
  const company = document.querySelector(`#experiencesList .editable-item:nth-child(${index + 1}) input[data-field="company"]`).value;
  const description = document.querySelector(`#experiencesList .editable-item:nth-child(${index + 1}) textarea[data-field="description"]`).value;
  // Update localStorage
  const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
  if (experiences[index]) {
    experiences[index] = { title, company, description };
    localStorage.setItem('experiences', JSON.stringify(experiences));
    alert('Experience updated!');
  }
}
