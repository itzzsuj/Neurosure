// src/scripts/seedPatients.js
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

// Sample data pools
const firstNames = [
  'Raj', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Deepa', 'Sanjay', 'Anjali', 'Rahul', 'Meera',
  'Arjun', 'Kavita', 'Manoj', 'Pooja', 'Ravi', 'Neha', 'Suresh', 'Lata', 'Dinesh', 'Shweta',
  'Ajay', 'Rekha', 'Vivek', 'Jyoti', 'Prakash', 'Anita', 'Gopal', 'Sarita', 'Naveen', 'Kiran',
  'Harish', 'Divya', 'Mukesh', 'Ritu', 'Jatin', 'Geeta', 'Kunal', 'Sangeeta', 'Nitin', 'Shilpa',
  'Ashok', 'Pallavi', 'Ramesh', 'Madhuri', 'Sachin', 'Vandana', 'Mahesh', 'Shobha', 'Anil', 'Usha'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Malhotra', 'Reddy', 'Nair',
  'Menon', 'Desai', 'Mehta', 'Choudhary', 'Thakur', 'Yadav', 'Mishra', 'Trivedi', 'Bose', 'Chatterjee',
  'Iyer', 'Rao', 'Naidu', 'Pillai', 'Kurian', 'George', 'D\'Souza', 'Fernandes', 'Khan', 'Ansari',
  'Kapoor', 'Khanna', 'Chopra', 'Malik', 'Sheikh', 'Das', 'Sen', 'Pal', 'Ghosh', 'Dutta',
  'Bhat', 'Hegde', 'Shetty', 'Nayak', 'Acharya', 'Gowda', 'Reddy', 'Naik', 'Kadam', 'Salvi'
];

const conditions = [
  'Diabetes Type 2', 'Hypertension', 'Asthma', 'Coronary Artery Disease', 'COPD',
  'Rheumatoid Arthritis', 'Osteoarthritis', 'Chronic Kidney Disease', 'Hypothyroidism',
  'Major Depression', 'Anxiety Disorder', 'Migraine', 'Sleep Apnea', 'Cataract',
  'Glaucoma', 'GERD', 'IBS', 'Psoriasis', 'Eczema', 'Hepatitis B'
];

const locations = [
  'urban_metro', 'urban_metro', 'urban_small', 'suburban', 'suburban', 'rural_town', 'rural_village'
];

const incomeLevels = ['low', 'middle_low', 'middle', 'middle_high', 'high'];
const educationLevels = ['high_school', 'bachelors', 'masters', 'phd', 'professional'];
const employmentStatus = ['employed_full', 'employed_part', 'self_employed', 'unemployed', 'retired', 'student'];
const genders = ['M', 'F', 'M', 'F', 'M', 'F', 'other']; // Weighted distribution
const severities = ['mild', 'moderate', 'severe', 'critical'];
const claimTypes = ['routine', 'emergency', 'hospitalization', 'outpatient', 'surgery', 'diagnostic', 'medication'];

// Generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random amount
const randomAmount = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) / 100) * 100;
};

// Generate claim history for a patient
const generateClaims = (patientAge, condition) => {
  const numClaims = Math.floor(Math.random() * 8); // 0-7 claims
  const claims = [];
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date();
  
  // Determine reliability based on condition and age
  const reliabilityBase = condition.includes('Diabetes') ? 0.7 : 
                         condition.includes('Hypertension') ? 0.75 :
                         condition.includes('Asthma') ? 0.8 : 0.85;
  
  for (let i = 0; i < numClaims; i++) {
    const date = randomDate(startDate, endDate);
    const claimType = claimTypes[Math.floor(Math.random() * claimTypes.length)];
    const isEmergency = claimType === 'emergency';
    const amount = randomAmount(
      isEmergency ? 15000 : 2000,
      isEmergency ? 80000 : 15000
    );
    
    // Approval probability based on reliability
    const approvalProb = reliabilityBase * (isEmergency ? 0.9 : 1.0);
    const approved = Math.random() < approvalProb;
    
    claims.push({
      date: date.toISOString().split('T')[0],
      claimType,
      amount,
      diagnosis: condition,
      approved
    });
  }
  
  return claims;
};

// Calculate BRS score from claims
const calculateBRS = (claims) => {
  if (claims.length === 0) return 0.85; // Default high reliability for no claims
  
  const approved = claims.filter(c => c.approved).length;
  const approvalRate = approved / claims.length;
  
  const emergencyCount = claims.filter(c => c.claimType === 'emergency').length;
  const emergencyRatio = emergencyCount / claims.length;
  
  // BRS formula (simplified version of your ML model)
  const brs = (approvalRate * 0.7) + (1 - emergencyRatio) * 0.3;
  
  return Math.round(brs * 100) / 100; // Round to 2 decimals
};

// Generate a single patient
const generatePatient = (index) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  
  const age = Math.floor(Math.random() * 60) + 25; // 25-85 years
  const gender = genders[Math.floor(Math.random() * genders.length)];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const claims = generateClaims(age, condition);
  const brsScore = calculateBRS(claims);
  
  // Determine risk level from BRS
  const riskLevel = brsScore > 0.7 ? 'Low' : brsScore > 0.4 ? 'Medium' : 'High';
  
  return {
    patientId: `P${String(index + 1).padStart(3, '0')}`,
    name,
    age,
    gender,
    location: locations[Math.floor(Math.random() * locations.length)],
    incomeLevel: incomeLevels[Math.floor(Math.random() * incomeLevels.length)],
    education: educationLevels[Math.floor(Math.random() * educationLevels.length)],
    employment: employmentStatus[Math.floor(Math.random() * employmentStatus.length)],
    primaryCondition: condition,
    secondaryConditions: Math.random() > 0.7 ? [conditions[Math.floor(Math.random() * conditions.length)]] : [],
    diagnosisYear: new Date().getFullYear() - Math.floor(Math.random() * 10) - 1,
    severity: severities[Math.floor(Math.random() * severities.length)],
    insuranceActive: true,
    enrollmentDate: randomDate(new Date(2018, 0, 1), new Date()).toISOString().split('T')[0],
    claims,
    brsScore,
    riskLevel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Seed function
const seedPatients = async () => {
  console.log('🌱 Starting to seed patients...');
  
  try {
    const patientsRef = collection(db, 'patients');
    let successCount = 0;
    
    for (let i = 0; i < 50; i++) {
      const patient = generatePatient(i);
      
      try {
        await addDoc(patientsRef, patient);
        successCount++;
        console.log(`✅ Added patient ${i + 1}/50: ${patient.name} (BRS: ${patient.brsScore})`);
      } catch (error) {
        console.error(`❌ Failed to add patient ${i + 1}:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 Successfully added ${successCount} patients to Firestore!`);
    console.log('📊 Summary:');
    console.log(`   - Total patients: ${successCount}`);
    console.log(`   - Average BRS: ${(successCount > 0 ? 'Calculated' : 'N/A')}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

// Run the seed function
seedPatients();