/**
 * Indian cities grouped by state/UT value.
 * Used for autocomplete on city fields (Q14, Q23).
 * Top cities per state — not exhaustive. Users can type any city freely.
 */
export const INDIAN_CITIES: Record<string, string[]> = {
  andhra_pradesh: [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
    'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur',
    'Eluru', 'Ongole', 'Srikakulam', 'Machilipatnam', 'Chittoor',
  ],
  arunachal_pradesh: [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro',
  ],
  assam: [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon',
    'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Sivasagar',
  ],
  bihar: [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga',
    'Purnia', 'Arrah', 'Begusarai', 'Katihar', 'Munger',
    'Chhapra', 'Bihar Sharif', 'Saharsa', 'Hajipur', 'Sasaram',
  ],
  chhattisgarh: [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg',
    'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur',
  ],
  goa: [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda',
  ],
  gujarat: [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
    'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad',
    'Morbi', 'Mehsana', 'Bharuch', 'Navsari', 'Vapi',
  ],
  haryana: [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal',
    'Hisar', 'Rohtak', 'Sonipat', 'Yamunanagar', 'Panchkula',
    'Bhiwani', 'Sirsa', 'Rewari', 'Kurukshetra',
  ],
  himachal_pradesh: [
    'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu',
    'Manali', 'Hamirpur', 'Una', 'Bilaspur', 'Kangra',
  ],
  jharkhand: [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh',
    'Deoghar', 'Giridih', 'Ramgarh', 'Dumka',
  ],
  karnataka: [
    'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Dharwad',
    'Belagavi', 'Kalaburagi', 'Davangere', 'Ballari', 'Tumakuru',
    'Shivamogga', 'Udupi', 'Raichur', 'Hassan', 'Bidar',
  ],
  kerala: [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam',
    'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram',
    'Ernakulam', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad',
  ],
  madhya_pradesh: [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain',
    'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
    'Katni', 'Singrauli', 'Burhanpur', 'Morena', 'Chhindwara',
  ],
  maharashtra: [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik',
    'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai',
    'Sangli', 'Akola', 'Jalgaon', 'Latur', 'Dhule',
    'Nanded', 'Ratnagiri', 'Satara', 'Chandrapur', 'Parbhani',
  ],
  manipur: [
    'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur',
  ],
  meghalaya: [
    'Shillong', 'Tura', 'Jowai', 'Nongstoin',
  ],
  mizoram: [
    'Aizawl', 'Lunglei', 'Champhai', 'Serchhip',
  ],
  nagaland: [
    'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha',
  ],
  odisha: [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
    'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda',
  ],
  punjab: [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
    'Mohali', 'Pathankot', 'Hoshiarpur', 'Moga', 'Firozpur',
  ],
  rajasthan: [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer',
    'Bikaner', 'Alwar', 'Bhilwara', 'Sikar', 'Sri Ganganagar',
    'Pali', 'Bharatpur', 'Tonk', 'Chittorgarh', 'Nagaur',
  ],
  sikkim: [
    'Gangtok', 'Namchi', 'Pelling', 'Mangan',
  ],
  tamil_nadu: [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi',
    'Thanjavur', 'Dindigul', 'Nagercoil', 'Kanchipuram', 'Hosur',
  ],
  telangana: [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Secunderabad',
  ],
  tripura: [
    'Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar',
  ],
  uttar_pradesh: [
    'Lucknow', 'Noida', 'Kanpur', 'Agra', 'Varanasi',
    'Ghaziabad', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh',
    'Moradabad', 'Gorakhpur', 'Saharanpur', 'Jhansi', 'Mathura',
    'Firozabad', 'Muzaffarnagar', 'Shahjahanpur', 'Rampur', 'Ayodhya',
    'Greater Noida',
  ],
  uttarakhand: [
    'Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Roorkee',
    'Kashipur', 'Rudrapur', 'Mussoorie', 'Nainital',
  ],
  west_bengal: [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri',
    'Bardhaman', 'Malda', 'Kharagpur', 'Haldia', 'Baharampur',
    'Darjeeling', 'Jalpaiguri', 'Krishnanagar', 'Kalyani',
  ],
  // Union Territories
  andaman_nicobar: [
    'Port Blair',
  ],
  chandigarh: [
    'Chandigarh',
  ],
  dadra_nagar_haveli: [
    'Silvassa', 'Daman', 'Diu',
  ],
  delhi: [
    'New Delhi', 'Delhi',
  ],
  jammu_kashmir: [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore',
    'Kathua', 'Udhampur',
  ],
  ladakh: [
    'Leh', 'Kargil',
  ],
  lakshadweep: [
    'Kavaratti',
  ],
  puducherry: [
    'Puducherry', 'Karaikal', 'Mahe', 'Yanam',
  ],
};

/**
 * Get cities for a given state value.
 * Returns empty array if state not found.
 */
export function getCitiesForState(stateValue: string): string[] {
  return INDIAN_CITIES[stateValue] ?? [];
}
