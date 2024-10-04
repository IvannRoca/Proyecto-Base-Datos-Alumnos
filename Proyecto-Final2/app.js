class Student {
    constructor(name, lastName, age) {
        this.name = name;
        this.lastName = lastName;
        this.age = age;
        this.subjects = [];
        this.grades = {};
    }

    enrollSubject(subject) { //este metodo agrega una materia asegurandose de que no se repita
        if (!this.subjects.includes(subject)) {
            this.subjects.push(subject);
        }
    }

    assignGrade(subject, grade) { //Este metodo asigan una calificacion al alumno
        this.grades[subject] = grade;
    }

    getAverage() { //Este metodo calcula el promedio de calificaciones
        const grades = Object.values(this.grades);
        return grades.length ? grades.reduce((a, b) => a + b) / grades.length : 0;
    }
}

class StudentManagementSystem {
    constructor() {
        this.students = [];
        this.groups = {};
        this.loadFromLocalStorage();
    }
//Metodos requeridos----------------------------------------------------------------

    addStudent(name, lastName, age) {
        const student = new Student(name, lastName, age);
        this.students.push(student);
        this.saveToLocalStorage();
        return student;
    }

    createGroup(groupName) {
        if (!this.groups[groupName]) {
            this.groups[groupName] = [];
        }
        this.saveToLocalStorage();
    }

    assignToGroup(groupName, student) {
        if (this.groups[groupName]) {
            this.groups[groupName].push(student);
            this.saveToLocalStorage();
        }
    }

    searchByName(name) {
        return this.students.filter(student => 
            student.name.toLowerCase().includes(name.toLowerCase()) || 
            student.lastName.toLowerCase().includes(name.toLowerCase())
        );
    }

    sortByGrade(ascending = true) {
        return [...this.students].sort((a, b) => {
            const avgA = a.getAverage();
            const avgB = b.getAverage();
            return ascending ? avgA - avgB : avgB - avgA;
        });
    }

    getGroupAverage(groupName) {
        if (!this.groups[groupName]) return 0;
        const groupAvg = this.groups[groupName].reduce((sum, student) => sum + student.getAverage(), 0);
        return groupAvg / this.groups[groupName].length || 0;
    }

    saveToLocalStorage() { //Guardar registro de alumnos en navegador
        localStorage.setItem('studentManagementSystem', JSON.stringify({
            students: this.students,
            groups: this.groups
        }));
    }

    loadFromLocalStorage() { //Recupera datos almacenados previamente en el localStorage
        const data = JSON.parse(localStorage.getItem('studentManagementSystem'));
        if (data) {
            this.students = data.students.map(s => Object.assign(new Student(), s));
            this.groups = data.groups;
        }
    }
}

const sms = new StudentManagementSystem();

// Funciones de la interfaz de usuario---------------------------------------
function updateStudentList() {
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '<h2>Lista de Estudiantes</h2>';
    sms.students.forEach(student => {
        studentList.innerHTML += `
            <p>
                <strong>${student.name} ${student.lastName}</strong> (${student.age} años)<br>
                Materias: ${student.subjects.join(', ')}<br>
                Calificaciones: ${Object.entries(student.grades).map(([subject, grade]) => `${subject}: ${grade}`).join(', ')}<br>
                Promedio: ${student.getAverage().toFixed(2)}
            </p>
        `;
    });
}

function updateGroupList() {
    const groupList = document.getElementById('groupList');
    groupList.innerHTML = '<h2>Grupos</h2>';
    for (const [groupName, students] of Object.entries(sms.groups)) {
        groupList.innerHTML += `
            <p>
                <strong>${groupName}</strong><br>
                Estudiantes: ${students.map(s => `${s.name} ${s.lastName}`).join(', ')}<br>
                Promedio del grupo: ${sms.getGroupAverage(groupName).toFixed(2)}
            </p>
        `;
    }
}

function updateSelects() {
    const selects = ['studentSelect', 'studentGradeSelect', 'studentGroupSelect'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '';
        sms.students.forEach(student => {
            const option = document.createElement('option');
            option.value = sms.students.indexOf(student);
            option.textContent = `${student.name} ${student.lastName}`;
            select.appendChild(option);
        });
    });

    const groupSelect = document.getElementById('groupSelect');
    groupSelect.innerHTML = '';
    for (const groupName of Object.keys(sms.groups)) {
        const option = document.createElement('option');
        option.value = groupName;
        option.textContent = groupName;
        groupSelect.appendChild(option);
    }
}

// Event Listeners---------------------------------------------
document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const lastName = document.getElementById('lastName').value;
    const age = parseInt(document.getElementById('age').value);
    sms.addStudent(name, lastName, age);
    updateStudentList();
    updateSelects();
    e.target.reset();
});

document.getElementById('subjectForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentIndex = document.getElementById('studentSelect').value;
    const subject = document.getElementById('subject').value;
    sms.students[studentIndex].enrollSubject(subject);
    sms.saveToLocalStorage();
    updateStudentList();
    e.target.reset();
});

document.getElementById('gradeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentIndex = document.getElementById('studentGradeSelect').value;
    const subject = document.getElementById('subjectSelect').value;
    const grade = parseFloat(document.getElementById('grade').value);
    sms.students[studentIndex].assignGrade(subject, grade);
    sms.saveToLocalStorage();
    updateStudentList();
    e.target.reset();
});

document.getElementById('groupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const groupName = document.getElementById('groupName').value;
    sms.createGroup(groupName);
    updateGroupList();
    updateSelects();
    e.target.reset();
});

document.getElementById('assignToGroupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const groupName = document.getElementById('groupSelect').value;
    const studentIndex = document.getElementById('studentGroupSelect').value;
    sms.assignToGroup(groupName, sms.students[studentIndex]);
    updateGroupList();
    e.target.reset();
});

document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value;
    const results = sms.searchByName(searchTerm);
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '<h2>Resultados de la búsqueda</h2>';
    results.forEach(student => {
        studentList.innerHTML += `
            <p>
                <strong>${student.name} ${student.lastName}</strong> (${student.age} años)<br>
                Materias: ${student.subjects.join(', ')}<br>
                Calificaciones: ${Object.entries(student.grades).map(([subject, grade]) => `${subject}: ${grade}`).join(', ')}<br>
                Promedio: ${student.getAverage().toFixed(2)}
            </p>
        `;
    });
});

document.getElementById('sortAscBtn').addEventListener('click', () => {
    const sortedStudents = sms.sortByGrade(true);
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '<h2>Estudiantes ordenados por calificación (ascendente)</h2>';
    sortedStudents.forEach(student => {
        studentList.innerHTML += `
            <p>
                <strong>${student.name} ${student.lastName}</strong> (${student.age} años)<br>
                Promedio: ${student.getAverage().toFixed(2)}
            </p>
        `;
    });
});

document.getElementById('sortDescBtn').addEventListener('click', () => {
    const sortedStudents = sms.sortByGrade(false);
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '<h2>Estudiantes ordenados por calificación (descendente)</h2>';
    sortedStudents.forEach(student => {
        studentList.innerHTML += `
            <p>
                <strong>${student.name} ${student.lastName}</strong> (${student.age} años)<br>
                Promedio: ${student.getAverage().toFixed(2)}
            </p>
        `;
    });
});

document.getElementById('getGroupAverageBtn').addEventListener('click', () => {
    const groupSelect = document.getElementById('groupSelect');
    const selectedGroup = groupSelect.value;
    if (selectedGroup) {
        const average = sms.getGroupAverage(selectedGroup);
        alert(`El promedio del grupo ${selectedGroup} es: ${average.toFixed(2)}`);
    } else {
        alert('Por favor, selecciona un grupo primero.');
    }
});

// Inicialización---------------------------------------------------------------
updateStudentList();
updateGroupList();
updateSelects();

// Actualizar el select de materias cuando se selecciona un estudiante
document.getElementById('studentGradeSelect').addEventListener('change', (e) => {
    const studentIndex = e.target.value;
    const subjectSelect = document.getElementById('subjectSelect');
    subjectSelect.innerHTML = '';
    sms.students[studentIndex].subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
});