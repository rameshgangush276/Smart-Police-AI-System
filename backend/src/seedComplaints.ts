import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const complaintsData = [
  {
    complainantName: "Amit Sharma",
    fatherHusbandName: "Rajesh Sharma",
    mobileNumber: "9876543210",
    address: "Sector 15, City Center",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
    incidentTime: "14:30",
    incidentLocation: "Near City Mall",
    latitude: 28.6139,
    longitude: 77.2090,
    crimeCategory: "NDPS Act",
    incidentDescription: "Apprehended suspect with 50 grams of suspected contraband (Heroin) during routine patrol near City Mall parking area.",
    suspectDetails: "Male, approx 30 years, wearing a black jacket and jeans.",
    witnessDetails: null,
    gender: "MALE",
    status: "FIR_REGISTERED",
    isFIR: true,
  },
  {
    complainantName: "Deepak Verma",
    fatherHusbandName: "Mohan Verma",
    mobileNumber: "9123456789",
    address: "Gandhi Nagar",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    incidentTime: "22:15",
    incidentLocation: "Gandhi Nagar Main Road",
    latitude: 28.6250,
    longitude: 77.2150,
    crimeCategory: "Arms Act",
    incidentDescription: "During naka checking, found an illegal country-made pistol (desi katta) and 2 live cartridges in the possession of the suspect.",
    suspectDetails: "Ravi Kumar, resident of Outer District.",
    witnessDetails: "Constable Suresh (Duty Officer)",
    gender: "MALE",
    status: "UNDER_INVESTIGATION",
    isFIR: true,
  },
  {
    complainantName: "Sneha Gupta",
    fatherHusbandName: "Ashok Gupta",
    mobileNumber: "9988776655",
    address: "Model Town",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    incidentTime: "19:45",
    incidentLocation: "Model Town Market",
    latitude: 28.6300,
    longitude: 77.2100,
    crimeCategory: "Chain Snatching",
    incidentDescription: "Two unknown persons on a black Splendor motorcycle snatched a gold chain from the complainant's neck while she was walking back home from the market.",
    suspectDetails: "Two men, rider wearing a helmet, pillion rider wearing a mask.",
    witnessDetails: "Local shop vendor saw the bike fleeing.",
    gender: "FEMALE",
    status: "PENDING",
    isFIR: false,
  },
  {
    complainantName: "Vikram Singh",
    fatherHusbandName: "Bhagat Singh",
    mobileNumber: "9876123450",
    address: "Lajpat Nagar",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    incidentTime: "11:00",
    incidentLocation: "Lajpat Nagar Metro Station",
    latitude: 28.5677,
    longitude: 77.2433,
    crimeCategory: "Theft",
    incidentDescription: "Wallet and mobile phone stolen from the back pocket while boarding the metro train during rush hour.",
    suspectDetails: "Unknown.",
    witnessDetails: null,
    gender: "MALE",
    status: "PENDING",
    isFIR: false,
  },
  {
    complainantName: "Rahul Dravid",
    fatherHusbandName: "Sharad Dravid",
    mobileNumber: "9001122334",
    address: "Koramangala, BLR",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 3)),
    incidentTime: "23:30",
    incidentLocation: "Outside Pub 80s",
    latitude: 28.5355,
    longitude: 77.2410,
    crimeCategory: "Assault",
    incidentDescription: "Complainant was physically assaulted by a group of 3 unidentified men after a verbal altercation over parking.",
    suspectDetails: "Group of 3 young men, appearing to be in their mid-20s. One had a visible tattoo on his right arm.",
    witnessDetails: "Parking attendant Ramu.",
    gender: "MALE",
    status: "FIR_REGISTERED",
    isFIR: true,
  },
  {
    complainantName: "Anjali Desai",
    fatherHusbandName: "Prakash Desai",
    mobileNumber: "9811223344",
    address: "Vasant Kunj",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 15)),
    incidentTime: "02:00",
    incidentLocation: "Vasant Kunj Sector C",
    latitude: 28.5298,
    longitude: 77.1650,
    crimeCategory: "House Theft",
    incidentDescription: "House broken into during the night while the family was out of town. Cash and jewelry worth approx 5 Lakhs were stolen.",
    suspectDetails: "Unknown. CCTV footage shows 2 masked men entering the premises.",
    witnessDetails: "Neighbor heard some noises around 2 AM but didn't investigate.",
    gender: "FEMALE",
    status: "UNDER_INVESTIGATION",
    isFIR: true,
  },
  {
    complainantName: "Sanjay Kumar",
    fatherHusbandName: "Ramesh Kumar",
    mobileNumber: "9955443322",
    address: "Rohini Sector 7",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    incidentTime: "16:15",
    incidentLocation: "Netaji Subhash Place",
    latitude: 28.6967,
    longitude: 77.1533,
    crimeCategory: "Arms Act",
    incidentDescription: "Anonymous tip led to the recovery of two illegal knives (button daar chaku) from a suspect loitering near the metro station.",
    suspectDetails: "Sunil alias 'Chintu', age 22.",
    witnessDetails: null,
    gender: "MALE",
    status: "FIR_REGISTERED",
    isFIR: true,
  },
  {
    complainantName: "Inspector Vijay",
    fatherHusbandName: "Govind",
    mobileNumber: "9000000001",
    address: "Police Station Central",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    incidentTime: "20:00",
    incidentLocation: "Highway Checkpost 4",
    latitude: 28.5000,
    longitude: 77.2000,
    crimeCategory: "NDPS Act",
    incidentDescription: "Intercepted a truck during night patrol and recovered 2 KGs of Charas hidden in the spare tire compartment.",
    suspectDetails: "Driver Mohan and Helper Shyam, both residents of neighboring state.",
    witnessDetails: "Constable Harish (Checkpost duty)",
    gender: "MALE",
    status: "UNDER_INVESTIGATION",
    isFIR: true,
  },
  {
    complainantName: "Priya Singh",
    fatherHusbandName: "Rajender Singh",
    mobileNumber: "9112233445",
    address: "Dwarka Sector 12",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 4)),
    incidentTime: "18:30",
    incidentLocation: "Dwarka Sector 12 Market",
    latitude: 28.5921,
    longitude: 77.0460,
    crimeCategory: "Chain Snatching",
    incidentDescription: "A boy on a scooter snatched a mobile phone from the complainant's hand while she was texting.",
    suspectDetails: "Young boy, riding a white Activa scooter without a number plate.",
    witnessDetails: null,
    gender: "FEMALE",
    status: "PENDING",
    isFIR: false,
  },
  {
    complainantName: "Kapil Dev",
    fatherHusbandName: "Ram Dev",
    mobileNumber: "9009009009",
    address: "South Extension",
    incidentDate: new Date(new Date().setDate(new Date().getDate() - 8)),
    incidentTime: "13:00",
    incidentLocation: "South Ex Market Road",
    latitude: 28.5686,
    longitude: 77.2215,
    crimeCategory: "Assault",
    incidentDescription: "Complainant was beaten with sticks by his neighbors over a property dispute.",
    suspectDetails: "Neighbor Ramesh and his two sons.",
    witnessDetails: "Several bystanders present during the daytime incident.",
    gender: "MALE",
    status: "FIR_REGISTERED",
    isFIR: true,
  }
];

async function main() {
  console.log('Starting exact complaint seeding...');
  
  // Try to find the officer we created
  let officer = await prisma.officer.findUnique({
      where: { officerId: 'OFF001' }
  });
  
  if (!officer) {
      console.log('Officer OFF001 not found, creating a default one for relations...');
      officer = await prisma.officer.create({
          data: {
              officerId: 'OFF001',
              password: 'password123', // Will not be usable without bcrypt
              name: 'Inspector Rahul',
              role: 'OFFICER'
          }
      });
  }

  let seededCount = 0;

  for (const complaint of complaintsData) {
    const complaintId = `COMP-${new Date().getTime().toString().substr(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    await prisma.complaint.create({
      data: {
        ...complaint,
        complaintId,
        officerId: officer.id // Assign all 10 to our test officer so they appear in their dashboard
      }
    });
    console.log(`Created complaint: ${complaintId} - ${complaint.crimeCategory}`);
    seededCount++;
  }

  console.log(`Successfully seeded ${seededCount} complaints.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
