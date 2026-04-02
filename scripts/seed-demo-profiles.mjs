#!/usr/bin/env node
/**
 * Seed 75 demo doctor profiles for matching algorithm demonstration.
 *
 * Creates:
 *   - 75 realistic doctor profiles (38 male, 37 female)
 *   - 15 deliberate match pairs with pre-seeded match_suggestions (scores 76–91)
 *   - 10 multi-match profiles with broad preferences
 *   - 5 match_presentations for top-scoring pairs
 *
 * Profile groups (0-indexed):
 *   0–14   Deliberate pair males   (paired with 38–52)
 *   15–19  Multi-match males
 *   20–37  Filler males
 *   38–52  Deliberate pair females (paired with 0–14)
 *   53–57  Multi-match females
 *   58–74  Filler females
 *
 * Run: node scripts/seed-demo-profiles.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const content = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  } catch { /* rely on env vars */ }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function genNotes(p) {
  return {
    fam_n: `${p.fam > 75 ? 'Strong' : p.fam > 60 ? 'Moderate' : 'Light'} family orientation; values ${p.family_arr || 'nuclear'} living.`,
    career_n: `${p.career > 80 ? 'Highly ambitious' : p.career > 70 ? 'Career-focused' : 'Professionally balanced'} with a clear sense of purpose.`,
    indep_n: `${p.indep > 65 ? 'Values significant personal space within a partnership' : p.indep > 50 ? 'Balanced between independence and togetherness' : 'Strongly values closeness and shared time with partner'}.`,
    emo_n: `${p.emo > 75 ? 'Highly expressive' : p.emo > 60 ? 'Moderately expressive' : 'Reserved'} emotionally; ${p.comm} communicator.`,
    soc_n: `${p.soc > 65 ? 'Socially active and enjoys community' : p.soc > 50 ? 'Selectively social' : 'Strongly prefers small intimate circles'}.`,
    trad_n: `${p.trad > 65 ? 'Culturally traditional and values customs' : p.trad > 45 ? 'Balanced between tradition and modernity' : 'Largely progressive in values and lifestyle'}.`,
    reloc_n: `${p.reloc > 70 ? 'Very open to relocating for career or relationship' : p.reloc > 55 ? 'Open to relocation within reason' : 'Prefers to remain rooted in current region'}.`,
    pace_n: `${p.pace > 65 ? 'High-energy, fast-paced approach to life' : p.pace > 50 ? 'Balanced and deliberate life pace' : 'Values a slower, more intentional lifestyle'}.`,
  };
}

function genSummary(p) {
  const drive = p.career > 78 ? 'highly driven' : 'dedicated';
  const trait = p.emo > 70 ? 'emotionally expressive' : p.trad > 60 ? 'culturally grounded' : 'thoughtful';
  return `A ${drive}, ${trait} ${p.specialty[0]} professional from ${p.city}. Values authentic connections and building a meaningful life alongside an equal partner.`;
}

function genQuote(p) {
  if (p.role === 'co_builder') return 'I want a partner who builds alongside me — in career, family, and life.';
  if (p.role === 'anchor_complement') return 'The best partnerships are where each person makes the other stronger.';
  return "I'm looking for someone real — someone I can grow with, not just be with.";
}

function genWorkExp(p) {
  if (p.med_status === 'completed_pg') {
    return [
      { org_name: `Apollo Hospital, ${p.city}`, designation: `Consultant ${p.specialty[0]}`, start_month: '06', start_year: '2021', end_month: '', end_year: '', is_current: true },
      { org_name: `Government Medical College, ${p.city}`, designation: 'Senior Resident', start_month: '01', start_year: '2019', end_month: '05', end_year: '2021', is_current: false },
    ];
  } else if (p.med_status === 'pursuing_pg') {
    return [
      { org_name: `Medical College Hospital, ${p.city}`, designation: 'Junior Resident', start_month: '01', start_year: '2023', end_month: '', end_year: '', is_current: true },
      { org_name: `District Hospital, ${p.city}`, designation: 'House Surgeon', start_month: '06', start_year: '2021', end_month: '12', end_year: '2022', is_current: false },
    ];
  }
  return [
    { org_name: `Primary Health Centre, ${p.city}`, designation: 'Medical Officer', start_month: '03', start_year: '2023', end_month: '', end_year: '', is_current: true },
  ];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// PROFILE DATA — 75 PROFILES
// ============================================================

const PROFILES = [

  // =====================================================================
  // GROUP A: DELIBERATE PAIR MALES (indices 0–14, paired with 38–52)
  // =====================================================================

  { // 0 ↔ 38 · target 88
    email:'arjun.nair@demo.samvaya.test', first:'Arjun', last:'Nair', gender:'male', dob:'1994-06-12',
    state:'Kerala', city:'Kochi', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:176, weight:72, siblings:1,
    father_occ:'Retired Army Officer', mother_occ:'School Principal',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Reading','Swimming','Classical Music','Travel','Chess'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Cardiology'], med_status:'completed_pg', total_exp:72,
    work:[
      {org_name:'Amrita Institute of Medical Sciences, Kochi', designation:'Senior Cardiology Resident', start_month:'01', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Government Medical College, Thrissur', designation:'Junior Resident', start_month:'06', start_year:'2019', end_month:'12', end_year:'2020', is_current:false},
    ],
    fam:82, career:80, indep:60, emo:70, soc:58, trad:38, reloc:72, pace:65,
    fam_n:'Values close family ties while building an independent life.',
    career_n:'Highly driven cardiologist with long-term academic ambitions.',
    indep_n:'Values personal space but remains deeply committed to partnership.',
    emo_n:'Emotionally articulate; prefers honest, direct conversations.',
    soc_n:'Enjoys small, meaningful gatherings over large social events.',
    trad_n:'Progressive outlook; fully open to cross-regional relationships.',
    reloc_n:'Open to relocating to any Indian metro for career or family.',
    pace_n:'Balances demanding clinical work with intentional personal downtime.',
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    summary:"A grounded, career-driven cardiologist who balances ambition with warmth. Values intellectual depth and emotional honesty above all.",
    quote:"I want someone who gets excited about their own goals the way I get excited about mine — and then we celebrate each other.",
    closing:"I believe a great marriage is built by two people who actively choose to inspire each other every day.",
    pa_min:26, pa_max:33, ph_min:155, ph_max:170, pref_states:['Kerala','Karnataka','Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Kind','Ambitious','Good communicator','Family-oriented','Emotionally mature'],
  },

  { // 1 ↔ 39 · target 85
    email:'vikram.rao@demo.samvaya.test', first:'Vikram', last:'Rao', gender:'male', dob:'1993-09-04',
    state:'Karnataka', city:'Bangalore', religion:'Hindu', tongue:'Kannada', languages:['Kannada','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:178, weight:74, siblings:1,
    father_occ:'Professor of Medicine', mother_occ:'Retired Banker',
    diet:'vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Running','Reading Medical Journals','Photography','Cooking','Badminton'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Neurology'], med_status:'completed_pg', total_exp:78,
    work:[
      {org_name:'NIMHANS, Bangalore', designation:'Consultant Neurologist', start_month:'03', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Manipal Hospital, Bangalore', designation:'Senior Resident', start_month:'07', start_year:'2019', end_month:'02', end_year:'2021', is_current:false},
    ],
    fam:70, career:82, indep:68, emo:60, soc:52, trad:35, reloc:78, pace:72,
    fam_n:'Values family deeply but is career-first at this stage of life.',
    career_n:'Highly ambitious with strong academic output and research profile.',
    indep_n:'Strongly values personal intellectual space within a relationship.',
    emo_n:'Thoughtful and measured in emotional expression; reflective.',
    soc_n:'Selective socially; prefers deep conversations over parties.',
    trad_n:'Progressive thinker; comfortable with modern relationship dynamics.',
    reloc_n:'Very open to relocation; sees it as part of professional growth.',
    pace_n:'Fast-paced, driven professional who structures time intentionally.',
    comm:'direct', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    summary:"A reflective, intellectually driven neurologist who balances high career ambition with warmth. Seeks a partner who matches his intellectual curiosity.",
    quote:"Depth matters to me — in conversations, in relationships, in work.",
    closing:"I approach this with full seriousness. I want a partner who is as invested in building something real as I am.",
    pa_min:27, pa_max:34, ph_min:155, ph_max:170, pref_states:['Karnataka','Kerala','Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Intellectually curious','Ambitious','Emotionally mature','Independent','Good communicator'],
  },

  { // 2 ↔ 40 · target 82
    email:'rohit.sharma@demo.samvaya.test', first:'Rohit', last:'Sharma', gender:'male', dob:'1996-03-18',
    state:'Maharashtra', city:'Mumbai', religion:'Hindu', tongue:'Marathi', languages:['Marathi','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:175, weight:76, siblings:2,
    father_occ:'Civil Engineer', mother_occ:'Teacher',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Cricket','Gym','Trekking','Cooking','Movies'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Orthopedics'], med_status:'pursuing_pg', total_exp:36,
    work:[
      {org_name:'KEM Hospital, Mumbai', designation:'Junior Orthopedic Resident', start_month:'01', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Cooper Hospital, Mumbai', designation:'House Surgeon', start_month:'07', start_year:'2021', end_month:'12', end_year:'2022', is_current:false},
    ],
    fam:72, career:75, indep:55, emo:65, soc:70, trad:48, reloc:65, pace:60,
    fam_n:'Close to family; sees marriage as building something together.',
    career_n:'Focused and driven during PG; clear career goals in orthopedics.',
    indep_n:'Comfortable with interdependence; values shared time highly.',
    emo_n:'Expressive and warm; likes addressing issues head-on.',
    soc_n:'Socially active; has a large friend circle from medical college.',
    trad_n:'Balanced — modern outlook with respect for family traditions.',
    reloc_n:'Open to staying in Maharashtra or relocating within India.',
    pace_n:'Energetic and sporty lifestyle; balances work and fitness well.',
    comm:'expressive', conflict:'addresses_immediately', role:'co_builder', fin:'financially_casual',
    summary:"A warm, sports-loving orthopedic resident with big ambitions and a genuine, direct personality. Seeks a partner to grow with.",
    quote:"I want someone who can match my energy and also help me slow down when needed.",
    closing:"I am serious about finding the right person and am ready for the next step.",
    pa_min:25, pa_max:32, ph_min:155, ph_max:170, pref_states:['Maharashtra','Goa','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Kind','Energetic','Family-oriented','Ambitious','Honest'],
  },

  { // 3 ↔ 41 · target 86
    email:'karthik.iyer@demo.samvaya.test', first:'Karthik', last:'Iyer', gender:'male', dob:'1995-11-22',
    state:'Tamil Nadu', city:'Chennai', religion:'Hindu', tongue:'Tamil', languages:['Tamil','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:true, blood:'B+', height:173, weight:70, siblings:1,
    father_occ:'Chartered Accountant', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Carnatic Music','Reading','Yoga','Photography','Cycling'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['General Surgery'], med_status:'completed_pg', total_exp:60,
    work:[
      {org_name:'Apollo Hospitals, Chennai', designation:'Consultant General Surgeon', start_month:'06', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Madras Medical College, Chennai', designation:'Senior Resident', start_month:'01', start_year:'2019', end_month:'05', end_year:'2021', is_current:false},
    ],
    fam:80, career:78, indep:52, emo:65, soc:55, trad:55, reloc:60, pace:58,
    fam_n:'Strong family values; very close to parents and sibling.',
    career_n:'Accomplished surgeon with strong institutional reputation.',
    indep_n:'Prefers closeness; values deep companionship in marriage.',
    emo_n:'Emotionally warm but expresses carefully in familiar settings.',
    soc_n:'Moderately social; prioritises depth over breadth in friendships.',
    trad_n:'Culturally Tamil and proud; balances tradition with modernity.',
    reloc_n:'Open to South Indian cities; flexible for the right partner.',
    pace_n:'Steady, structured approach to both work and personal life.',
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:"A culturally grounded Tamil surgeon with deep family values and a calm, supportive nature. Seeks a partner who shares his respect for tradition and ambition.",
    quote:"The best relationships are built quietly, with consistency and care.",
    closing:"I am ready for marriage and looking for someone who values both career and family equally.",
    pa_min:27, pa_max:33, ph_min:155, ph_max:168, pref_states:['Tamil Nadu','Kerala','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Family-oriented','Humble','Caring','Financially responsible','Grounded'],
  },

  { // 4 ↔ 42 · target 89
    email:'siddharth.patel@demo.samvaya.test', first:'Siddharth', last:'Patel', gender:'male', dob:'1992-07-08',
    state:'Gujarat', city:'Ahmedabad', religion:'Hindu', tongue:'Gujarati', languages:['Gujarati','Hindi','English'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'AB+', height:174, weight:73, siblings:2,
    father_occ:'Business Owner', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Business Reading','Yoga','Family Gatherings','Badminton','Cooking'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Dermatology'], med_status:'completed_pg', total_exp:84,
    work:[
      {org_name:'Shalby Hospital, Ahmedabad', designation:'Consultant Dermatologist', start_month:'04', start_year:'2020', end_month:'', end_year:'', is_current:true},
      {org_name:'BJ Medical College, Ahmedabad', designation:'Senior Resident', start_month:'07', start_year:'2018', end_month:'03', end_year:'2020', is_current:false},
    ],
    fam:85, career:72, indep:45, emo:62, soc:65, trad:72, reloc:50, pace:55,
    fam_n:'Family is the centre of his world; deeply rooted in joint family values.',
    career_n:'Established dermatologist with a busy private practice.',
    indep_n:'Strongly values togetherness; sees marriage as full partnership.',
    emo_n:'Warm and expressive within family; reserved with new acquaintances.',
    soc_n:'Socially active within the Gujarati business community.',
    trad_n:'Deeply traditional; values customs, rituals, and family structure.',
    reloc_n:'Prefers to remain in Gujarat; deeply rooted in Ahmedabad.',
    pace_n:'Steady, content lifestyle centred around family and community.',
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:"A well-established Gujarati dermatologist with deep family values and community roots. Seeks a partner who shares his love for tradition and wants to build a warm joint family life.",
    quote:"A home is where family comes first — everything else grows from that.",
    closing:"I want a partner who values what I value: family, respect, and building a stable, warm life together.",
    pa_min:28, pa_max:35, ph_min:155, ph_max:168, pref_states:['Gujarat','Rajasthan','Maharashtra'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way',
    qualities:['Family-oriented','Grounded','Financially responsible','Traditional','Caring'],
  },

  { // 5 ↔ 43 · target 83
    email:'aditya.verma@demo.samvaya.test', first:'Aditya', last:'Verma', gender:'male', dob:'1997-04-15',
    state:'Uttar Pradesh', city:'Lucknow', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'O+', height:172, weight:68, siblings:1,
    father_occ:'Government Doctor', mother_occ:'Bank Manager',
    diet:'eggetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Writing','Poetry','Meditation','Classical Literature','Hiking'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Psychiatry'], med_status:'pursuing_pg', total_exp:30,
    work:[
      {org_name:'King George Medical University, Lucknow', designation:'Junior Psychiatry Resident', start_month:'07', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'District Hospital, Lucknow', designation:'House Surgeon', start_month:'01', start_year:'2022', end_month:'06', end_year:'2023', is_current:false},
    ],
    fam:70, career:72, indep:62, emo:80, soc:62, trad:45, reloc:68, pace:58,
    fam_n:'Values family warmly; close to parents but embraces modern family structures.',
    career_n:'Thoughtful and driven; drawn to the depth and complexity of psychiatry.',
    indep_n:'Comfortable balance between independence and togetherness.',
    emo_n:'Highly emotionally expressive; talks about feelings naturally.',
    soc_n:'Meaningfully social; enjoys intellectual conversations with close friends.',
    trad_n:'Progressively minded North Indian; respects culture without being bound by it.',
    reloc_n:'Open to relocating within India for career or relationship.',
    pace_n:'Thoughtful and deliberate in pace; finds balance between depth and productivity.',
    comm:'expressive', conflict:'collaborative', role:'co_builder', fin:'financially_intentional',
    summary:"A sensitive, emotionally intelligent psychiatrist with a creative inner life. Seeks a partner who values deep conversations, intellectual growth, and genuine emotional connection.",
    quote:"I want a relationship built on real understanding — where we know each other deeply.",
    closing:"Psychiatry taught me to listen. I want a partner I can truly listen to and be heard by.",
    pa_min:24, pa_max:31, ph_min:155, ph_max:170, pref_states:['Uttar Pradesh','Delhi','Rajasthan'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['eggetarian','vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Emotionally mature','Intellectually curious','Kind','Open-minded','Supportive'],
  },

  { // 6 ↔ 44 · target 87
    email:'rahul.mehta@demo.samvaya.test', first:'Rahul', last:'Mehta', gender:'male', dob:'1991-12-03',
    state:'Rajasthan', city:'Jaipur', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English','Rajasthani'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'A+', height:175, weight:78, siblings:2,
    father_occ:'Retired IAS Officer', mother_occ:'Doctor (GP)',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading History','Table Tennis','Family Events','Listening to Devotional Music','Cooking'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Radiology'], med_status:'completed_pg', total_exp:90,
    work:[
      {org_name:'SMS Medical College, Jaipur', designation:'Senior Radiologist', start_month:'08', start_year:'2020', end_month:'', end_year:'', is_current:true},
      {org_name:'Narayana Hospital, Jaipur', designation:'Resident Radiologist', start_month:'01', start_year:'2018', end_month:'07', end_year:'2020', is_current:false},
    ],
    fam:80, career:74, indep:48, emo:60, soc:55, trad:68, reloc:52, pace:55,
    fam_n:'Deeply family-oriented; believes in the joint family system strongly.',
    career_n:'Accomplished radiologist; values career stability over rapid advancement.',
    indep_n:'Prefers togetherness; sees marriage as a complete shared life.',
    emo_n:'Reserved in new settings; warm and open with close family.',
    soc_n:'Moderate social life; prefers family events over parties.',
    trad_n:'Culturally traditional; values rituals, kundali, and family approval.',
    reloc_n:'Prefers Jaipur; open to Rajasthan cities only.',
    pace_n:'Steady, grounded pace; values stability and routine.',
    comm:'reserved', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:"A stable, traditional Rajasthani radiologist from a prominent family. Values deep-rooted family traditions and seeks a partner ready to build a warm, grounded home.",
    quote:"The right person feels like home — familiar, safe, and full of warmth.",
    closing:"I am fully ready to commit and build a life that honours both families.",
    pa_min:29, pa_max:36, ph_min:155, ph_max:168, pref_states:['Rajasthan','Uttar Pradesh','Delhi'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way',
    qualities:['Family-oriented','Traditional','Financially responsible','Humble','Grounded'],
  },

  { // 7 ↔ 45 · target 79
    email:'nikhil.reddy@demo.samvaya.test', first:'Nikhil', last:'Reddy', gender:'male', dob:'1996-08-27',
    state:'Telangana', city:'Hyderabad', religion:'Hindu', tongue:'Telugu', languages:['Telugu','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:174, weight:72, siblings:1,
    father_occ:'Software Engineer', mother_occ:'Doctor (Paediatrician)',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Football','Gaming','Travel','Stand-up Comedy','Cooking'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'open_to_it',
    specialty:['Pediatrics'], med_status:'pursuing_pg', total_exp:32,
    work:[
      {org_name:'Niloufer Hospital, Hyderabad', designation:'Junior Paediatrics Resident', start_month:'02', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Gandhi Hospital, Hyderabad', designation:'House Surgeon', start_month:'07', start_year:'2021', end_month:'01', end_year:'2023', is_current:false},
    ],
    fam:65, career:78, indep:72, emo:60, soc:68, trad:50, reloc:70, pace:65,
    fam_n:'Values family but prioritises building his own space first.',
    career_n:'Ambitious and driven in paediatrics; strong academic record.',
    indep_n:'Values personal autonomy significantly within a relationship.',
    emo_n:'Direct communicator; comfortable discussing issues openly.',
    soc_n:'Socially active and energetic; large social circle.',
    trad_n:'Culturally aware but modern in outlook.',
    reloc_n:'Open to relocating for career; comfortable across South India.',
    pace_n:'Fast-paced; balances residency demands with an active social life.',
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_casual',
    summary:"An energetic, modern paediatric resident with a fun personality and clear ambitions. Seeks a partner who is equally driven and comfortable with a modern, equal relationship.",
    quote:"Life's too short to not enjoy it — I want a partner who brings energy to our life together.",
    closing:"I am looking for someone genuine, driven, and fun to build a life with.",
    pa_min:25, pa_max:32, ph_min:155, ph_max:170, pref_states:['Telangana','Andhra Pradesh','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Energetic','Ambitious','Kind','Honest','Open-minded'],
  },

  { // 8 ↔ 46 · target 84
    email:'suresh.krishnan@demo.samvaya.test', first:'Suresh', last:'Krishnan', gender:'male', dob:'1993-02-14',
    state:'Tamil Nadu', city:'Coimbatore', religion:'Hindu', tongue:'Tamil', languages:['Tamil','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:170, weight:68, siblings:0,
    father_occ:'Doctor (Surgeon)', mother_occ:'Teacher',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Running Marathons','Carnatic Music','Reading','Cooking South Indian Food','Volunteering'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Anesthesiology'], med_status:'completed_pg', total_exp:66,
    work:[
      {org_name:'PSG Institute of Medical Sciences, Coimbatore', designation:'Consultant Anaesthesiologist', start_month:'09', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Kovai Medical Centre, Coimbatore', designation:'Senior Resident', start_month:'01', start_year:'2020', end_month:'08', end_year:'2021', is_current:false},
    ],
    fam:76, career:76, indep:55, emo:62, soc:50, trad:40, reloc:70, pace:60,
    fam_n:'Grounded family person; close to parents; values emotional stability.',
    career_n:'Calm and precise professional; highly respected in his department.',
    indep_n:'Balanced; comfortable with closeness and individuality.',
    emo_n:'Measured emotional expression; direct when it matters.',
    soc_n:'Quiet social life; prefers deep one-on-one connections.',
    trad_n:'Moderately traditional; respects culture without being constrained.',
    reloc_n:'Open to South Indian cities; has lived across Tamil Nadu.',
    pace_n:'Steady, intentional pace; values quality over quantity.',
    comm:'direct', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    summary:"A calm, disciplined anaesthesiologist with a marathoner's mindset applied to life. Values steadiness, depth, and genuine connection in a partner.",
    quote:"I want a relationship that is steady and deep — like a long race, not a sprint.",
    closing:"I have thought carefully about what I want in a partner. I am ready.",
    pa_min:27, pa_max:34, ph_min:155, ph_max:168, pref_states:['Tamil Nadu','Kerala','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Grounded','Kind','Emotionally mature','Health-conscious','Supportive'],
  },

  { // 9 ↔ 47 · target 91
    email:'pradeep.singh@demo.samvaya.test', first:'Pradeep', last:'Singh', gender:'male', dob:'1990-10-30',
    state:'Punjab', city:'Chandigarh', religion:'Sikh', tongue:'Punjabi', languages:['Punjabi','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:182, weight:82, siblings:2,
    father_occ:'Senior Army Officer (Retired)', mother_occ:'Professor',
    diet:'non_vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Kabaddi','Cooking','Community Service','Reading Punjabi Literature','Hiking'],
    timeline:'within_6_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'open_to_it',
    specialty:['ENT (Otorhinolaryngology)'], med_status:'completed_pg', total_exp:96,
    work:[
      {org_name:'PGI Chandigarh', designation:'Consultant ENT Surgeon', start_month:'05', start_year:'2019', end_month:'', end_year:'', is_current:true},
      {org_name:'Fortis Hospital, Mohali', designation:'Senior Resident ENT', start_month:'06', start_year:'2017', end_month:'04', end_year:'2019', is_current:false},
    ],
    fam:85, career:76, indep:48, emo:68, soc:70, trad:62, reloc:58, pace:58,
    fam_n:'Deeply family-oriented; community and family gatherings are central to his life.',
    career_n:'Respected ENT surgeon; values professional excellence and mentoring juniors.',
    indep_n:'Strongly values togetherness; prefers a close, collaborative partnership.',
    emo_n:'Expressive and warm; comfortable sharing feelings openly.',
    soc_n:'Highly social; loves community events and bringing people together.',
    trad_n:'Culturally Sikh with modern views; proud of heritage without rigidity.',
    reloc_n:'Open to relocation for the right person; rooted but flexible.',
    pace_n:'Energetic and engaged; balances demanding surgery schedule with full personal life.',
    comm:'expressive', conflict:'collaborative', role:'co_builder', fin:'financially_intentional',
    summary:"A warm, community-driven ENT surgeon with a big heart and strong family values. The kind of person who makes everyone around him feel at home.",
    quote:"I want a partner who can be my best friend, my home, and my greatest adventure.",
    closing:"I am completely ready — in every way — to build a beautiful life with the right person.",
    pa_min:30, pa_max:37, ph_min:158, ph_max:175, pref_states:['Punjab','Delhi','Haryana'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Kind','Family-oriented','Emotionally mature','Supportive','Grounded'],
  },

  { // 10 ↔ 48 · target 82
    email:'manish.gupta@demo.samvaya.test', first:'Manish', last:'Gupta', gender:'male', dob:'1995-05-19',
    state:'Delhi', city:'New Delhi', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English','Punjabi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:174, weight:70, siblings:1,
    father_occ:'Businessman', mother_occ:'Doctor (Gynaecologist)',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Cycling','Reading','Theatre','Badminton','Travel'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Ophthalmology'], med_status:'completed_pg', total_exp:60,
    work:[
      {org_name:'Dr. Shroff\'s Charity Eye Hospital, Delhi', designation:'Consultant Ophthalmologist', start_month:'07', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'RML Hospital, Delhi', designation:'Senior Resident', start_month:'01', start_year:'2019', end_month:'06', end_year:'2021', is_current:false},
    ],
    fam:74, career:78, indep:55, emo:65, soc:58, trad:40, reloc:65, pace:62,
    fam_n:'Close family ties; values a warm home life alongside a strong career.',
    career_n:'Accomplished ophthalmologist; clear about long-term surgical goals.',
    indep_n:'Comfortable balance; values couple time and personal space equally.',
    emo_n:'Direct and emotionally honest; addresses issues without delay.',
    soc_n:'Selective; cultivates fewer deep friendships over many shallow ones.',
    trad_n:'Modern Delhi professional; respects roots without being traditional.',
    reloc_n:'Open to staying in Delhi NCR or relocating for the right person.',
    pace_n:'Structured and balanced; makes time for both career and personal growth.',
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    summary:"A thoughtful, career-focused Delhi ophthalmologist who values genuine emotional connection and intellectual compatibility in a partner.",
    quote:"I want someone who brings calm to my day and passion to our shared life.",
    closing:"I am ready and intentional about finding the right person to build a life with.",
    pa_min:26, pa_max:33, ph_min:155, ph_max:170, pref_states:['Delhi','Haryana','Uttar Pradesh'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Kind','Ambitious','Honest','Emotionally mature','Health-conscious'],
  },

  { // 11 ↔ 49 · target 76
    email:'deepak.nambiar@demo.samvaya.test', first:'Deepak', last:'Nambiar', gender:'male', dob:'1998-09-06',
    state:'Kerala', city:'Thiruvananthapuram', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Tamil'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'O+', height:170, weight:65, siblings:1,
    father_occ:'Journalist', mother_occ:'School Principal',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading Philosophy','Yoga','Painting','Travelling','Writing'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'yes_absolutely',
    specialty:['Obstetrics & Gynecology'], med_status:'pursuing_pg', total_exp:28,
    work:[
      {org_name:'Government Medical College, Thiruvananthapuram', designation:'Junior Resident OBG', start_month:'08', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'SAT Hospital, Thiruvananthapuram', designation:'House Surgeon', start_month:'02', start_year:'2022', end_month:'07', end_year:'2023', is_current:false},
    ],
    fam:72, career:74, indep:58, emo:72, soc:55, trad:42, reloc:80, pace:65,
    fam_n:'Warm family values; progressive about gender roles in marriage.',
    career_n:'Pursuing OBG with genuine passion for women\'s health.',
    indep_n:'Values both closeness and personal space in a relationship.',
    emo_n:'Expressive and emotionally aware; communicates feelings naturally.',
    soc_n:'Moderate social preferences; values meaningful connections.',
    trad_n:'Progressive; comfortable with any cultural background.',
    reloc_n:'Very open to relocation; excited by the possibility of new places.',
    pace_n:'Balanced and reflective in pace; makes time for creative pursuits.',
    comm:'expressive', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    summary:"A progressive, emotionally expressive male OBG resident with artistic sensibilities and a genuine openness to building something new. Unusual specialty signals authentic empathy.",
    quote:"I chose OBG because I care — about people, about health, about what matters.",
    closing:"I am looking for someone who sees depth and soul as essential in a partnership.",
    pa_min:24, pa_max:30, ph_min:155, ph_max:168, pref_states:['Kerala','Tamil Nadu','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Emotionally mature','Open-minded','Creative','Kind','Intellectually curious'],
  },

  { // 12 ↔ 50 · target 80
    email:'aryan.kapoor@demo.samvaya.test', first:'Aryan', last:'Kapoor', gender:'male', dob:'1994-01-25',
    state:'Haryana', city:'Gurugram', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English','Punjabi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:179, weight:78, siblings:1,
    father_occ:'Senior Corporate Executive', mother_occ:'Doctor (Radiologist)',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Gym','Travel','Music (Guitar)','Cooking','Tennis'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['General Medicine'], med_status:'completed_pg', total_exp:72,
    work:[
      {org_name:'Medanta Hospital, Gurugram', designation:'Consultant Physician', start_month:'03', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Max Hospital, Delhi', designation:'Senior Resident', start_month:'07', start_year:'2019', end_month:'02', end_year:'2021', is_current:false},
    ],
    fam:70, career:72, indep:62, emo:65, soc:72, trad:45, reloc:65, pace:62,
    fam_n:'Values family warmly; has a modern, balanced approach to family structure.',
    career_n:'Steady and respected physician; values work-life integration.',
    indep_n:'Comfortable with both couple time and individual space.',
    emo_n:'Direct communicator; prefers to address issues without delay.',
    soc_n:'Socially confident and active; enjoys meeting new people.',
    trad_n:'Modern NCR professional with grounded values.',
    reloc_n:'Open to NCR metro area or beyond for the right relationship.',
    pace_n:'Active and social; fits a lot into his schedule intentionally.',
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_casual',
    summary:"A confident, socially adept NCR physician with an active lifestyle and genuine warmth. Seeks a partner with ambition and personality to match.",
    quote:"I want someone who can keep up — in conversations, adventures, and life.",
    closing:"I'm serious about this and ready to put in the effort to build something real.",
    pa_min:26, pa_max:33, ph_min:155, ph_max:170, pref_states:['Haryana','Delhi','Punjab'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian','vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Ambitious','Good communicator','Energetic','Family-oriented','Honest'],
  },

  { // 13 ↔ 51 · target 88
    email:'tushar.joshi@demo.samvaya.test', first:'Tushar', last:'Joshi', gender:'male', dob:'1992-08-11',
    state:'Maharashtra', city:'Pune', religion:'Hindu', tongue:'Marathi', languages:['Marathi','English','Hindi'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:true, blood:'B+', height:172, weight:71, siblings:2,
    father_occ:'College Professor', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Classical Reading','Chess','Gardening','Family Events','Temple Visits'],
    timeline:'within_6_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Pathology'], med_status:'completed_pg', total_exp:90,
    work:[
      {org_name:'Deenanath Mangeshkar Hospital, Pune', designation:'Senior Pathologist', start_month:'04', start_year:'2019', end_month:'', end_year:'', is_current:true},
      {org_name:'BJ Government Medical College, Pune', designation:'Senior Resident', start_month:'07', start_year:'2017', end_month:'03', end_year:'2019', is_current:false},
    ],
    fam:82, career:72, indep:48, emo:62, soc:58, trad:65, reloc:50, pace:55,
    fam_n:'Family is central; believes in togetherness and multigenerational values.',
    career_n:'Established pathologist; values depth of knowledge over rapid advancement.',
    indep_n:'Strongly values closeness and shared life with partner.',
    emo_n:'Measured in emotional expression; very warm with family.',
    soc_n:'Moderate social life; prioritises family time over social events.',
    trad_n:'Traditional Maharashtrian values; appreciates customs and ceremonies.',
    reloc_n:'Prefers to remain in Pune; very rooted in the city.',
    pace_n:'Steady and content; values a structured, meaningful daily life.',
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:"A grounded, traditional Pune pathologist with deep family values and quiet depth. Seeks a partner who shares his love for stability, culture, and building a warm home.",
    quote:"I want the kind of quiet, steady love that lasts — not the kind that fades.",
    closing:"I am fully ready and looking for someone who values what I value: family, depth, and commitment.",
    pa_min:28, pa_max:35, ph_min:155, ph_max:168, pref_states:['Maharashtra','Goa','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Family-oriented','Traditional','Grounded','Financially responsible','Humble'],
  },

  { // 14 ↔ 52 · target 77
    email:'vivek.menon@demo.samvaya.test', first:'Vivek', last:'Menon', gender:'male', dob:'1997-06-30',
    state:'Kerala', city:'Kozhikode', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Tamil'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'O-', height:173, weight:68, siblings:1,
    father_occ:'Architect', mother_occ:'Physiotherapist',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Trekking','Wildlife Photography','Guitar','Reading Science','Swimming'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'yes_absolutely',
    specialty:['Nephrology'], med_status:'pursuing_pg', total_exp:30,
    work:[
      {org_name:'Government Medical College, Kozhikode', designation:'Junior Nephrology Resident', start_month:'08', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'MIMS Hospital, Kozhikode', designation:'House Surgeon', start_month:'02', start_year:'2022', end_month:'07', end_year:'2023', is_current:false},
    ],
    fam:72, career:76, indep:60, emo:68, soc:55, trad:38, reloc:72, pace:62,
    fam_n:'Values family warmly; building his own identity alongside his roots.',
    career_n:'Driven nephrology resident; ambitious about subspecialisation.',
    indep_n:'Values balance; comfortable with both independent and shared time.',
    emo_n:'Expressive and genuine; values authentic emotional conversations.',
    soc_n:'Selective; prefers meaningful connections over broad socialising.',
    trad_n:'Progressive; comfortable with partners from any background.',
    reloc_n:'Very open to relocation; excited by new opportunities.',
    pace_n:'Balanced; makes time for nature and creative pursuits outside work.',
    comm:'expressive', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    summary:"A curious, outdoorsy nephrology resident with genuine depth and a progressive outlook. Seeks a partner who values adventure, authenticity, and building something meaningful.",
    quote:"I want to explore the world with my partner — literally and in every other sense.",
    closing:"I'm approaching this with openness and intention. Ready for the real thing.",
    pa_min:24, pa_max:31, ph_min:155, ph_max:170, pref_states:['Kerala','Tamil Nadu','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Adventurous','Emotionally mature','Open-minded','Intellectually curious','Kind'],
  },

  // =====================================================================
  // GROUP B: MULTI-MATCH MALES (indices 15–19, broad preferences)
  // =====================================================================

  { // 15
    email:'sameer.bose@demo.samvaya.test', first:'Sameer', last:'Bose', gender:'male', dob:'1995-07-14',
    state:'West Bengal', city:'Kolkata', religion:'Hindu', tongue:'Bengali', languages:['Bengali','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:175, weight:72, siblings:1,
    father_occ:'Retired Government Employee', mother_occ:'Teacher',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Football','Tagore Poetry','Cooking','Travel','Music'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'yes_absolutely',
    specialty:['Cardiology'], med_status:'completed_pg', total_exp:66,
    work:[
      {org_name:'SSKM Hospital, Kolkata', designation:'Consultant Cardiologist', start_month:'07', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'NRS Medical College, Kolkata', designation:'Senior Resident', start_month:'01', start_year:'2019', end_month:'06', end_year:'2021', is_current:false},
    ],
    fam:65, career:68, indep:55, emo:62, soc:65, trad:50, reloc:70, pace:60,
    comm:'direct', conflict:'reflects_first', role:'flexible', fin:'financially_intentional',
    summary:'A warm, open-minded Bengali cardiologist who is flexible about most things and values genuine connection above all. Comfortable across cultures and open to relocation anywhere in India.',
    quote:'I care more about the person than any checklist.',
    closing:'I am open to love from wherever it comes.',
    pa_min:24, pa_max:36, ph_min:155, ph_max:172, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['non_vegetarian','vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Kind','Open-minded','Good communicator','Emotionally mature','Supportive'],
  },

  { // 16
    email:'rohan.das@demo.samvaya.test', first:'Rohan', last:'Das', gender:'male', dob:'1993-04-22',
    state:'West Bengal', city:'Kolkata', religion:'Hindu', tongue:'Bengali', languages:['Bengali','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:177, weight:75, siblings:2,
    father_occ:'Professor of Surgery', mother_occ:'Artist',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading','Film Photography','Travelling','Cooking','Swimming'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'yes_absolutely',
    specialty:['Neurosurgery'], med_status:'completed_pg', total_exp:78,
    work:[
      {org_name:'IPGME&R, Kolkata', designation:'Consultant Neurosurgeon', start_month:'04', start_year:'2020', end_month:'', end_year:'', is_current:true},
      {org_name:'NRS Medical College, Kolkata', designation:'Senior Resident', start_month:'06', start_year:'2018', end_month:'03', end_year:'2020', is_current:false},
    ],
    fam:62, career:70, indep:58, emo:58, soc:60, trad:48, reloc:75, pace:65,
    comm:'direct', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    summary:'An intellectually open neurosurgeon with wide cultural curiosity and no fixed preferences. Comfortable in any part of India, with any background.',
    quote:'Interesting people find me interesting. That is how I want to find my partner.',
    closing:'Geography and background matter less than depth of character.',
    pa_min:26, pa_max:38, ph_min:155, ph_max:172, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian','vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Intellectually curious','Open-minded','Ambitious','Kind','Independent'],
  },

  { // 17
    email:'ankur.mishra@demo.samvaya.test', first:'Ankur', last:'Mishra', gender:'male', dob:'1998-11-08',
    state:'Madhya Pradesh', city:'Bhopal', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'O+', height:171, weight:67, siblings:1,
    father_occ:'Government Doctor', mother_occ:'Government Teacher',
    diet:'eggetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Yoga','Reading','Travelling','Cooking','Volunteering in Rural Health'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'yes_absolutely',
    specialty:['Pulmonology'], med_status:'pursuing_pg', total_exp:24,
    work:[
      {org_name:'AIIMS Bhopal', designation:'Junior Pulmonology Resident', start_month:'07', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Hamidia Hospital, Bhopal', designation:'House Surgeon', start_month:'01', start_year:'2022', end_month:'06', end_year:'2023', is_current:false},
    ],
    fam:68, career:72, indep:52, emo:65, soc:58, trad:45, reloc:78, pace:60,
    comm:'expressive', conflict:'collaborative', role:'flexible', fin:'financially_casual',
    summary:'A community-minded, socially conscious pulmonology resident from MP with no rigid preferences. Open to all backgrounds, very willing to relocate.',
    quote:'I want a partner who cares about more than just themselves. The rest we can figure out.',
    closing:'I am open, ready, and looking for someone genuine.',
    pa_min:23, pa_max:33, ph_min:155, ph_max:170, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['eggetarian','vegetarian','non_vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Kind','Humble','Open-minded','Caring','Supportive'],
  },

  { // 18
    email:'devraj.pillai@demo.samvaya.test', first:'Devraj', last:'Pillai', gender:'male', dob:'1991-03-17',
    state:'Kerala', city:'Kochi', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Tamil','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'AB+', height:174, weight:73, siblings:0,
    father_occ:'Retired IFS Officer', mother_occ:'Retired Doctor',
    diet:'vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading World Literature','Travelling Internationally','Cooking','Classical Music','Long Drives'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'yes_absolutely',
    specialty:['Endocrinology'], med_status:'completed_pg', total_exp:84,
    work:[
      {org_name:'KIMS Hospital, Thiruvananthapuram', designation:'Consultant Endocrinologist', start_month:'02', start_year:'2019', end_month:'', end_year:'', is_current:true},
      {org_name:'Amrita Institute, Kochi', designation:'Senior Resident', start_month:'06', start_year:'2017', end_month:'01', end_year:'2019', is_current:false},
    ],
    fam:70, career:68, indep:55, emo:62, soc:62, trad:52, reloc:65, pace:58,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:'A cosmopolitan, widely-travelled Kerala endocrinologist with broad cultural exposure. No location or background preference — just genuine compatibility.',
    quote:'I have lived in many places and learnt that the right person transcends all preferences.',
    closing:'I approach this without a list of conditions. Just openness.',
    pa_min:27, pa_max:40, ph_min:155, ph_max:172, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Open-minded','Grounded','Intellectually curious','Supportive','Financially responsible'],
  },

  { // 19
    email:'kartik.aggarwal@demo.samvaya.test', first:'Kartik', last:'Aggarwal', gender:'male', dob:'1996-09-29',
    state:'Delhi', city:'New Delhi', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English','Punjabi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:175, weight:70, siblings:1,
    father_occ:'Doctor (Rheumatologist)', mother_occ:'Architect',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Running','Reading','Cooking','Travel','Tech Hobbies'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Rheumatology'], med_status:'pursuing_pg', total_exp:26,
    work:[
      {org_name:'AIIMS Delhi', designation:'Junior Rheumatology Resident', start_month:'08', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Safdarjung Hospital, Delhi', designation:'House Surgeon', start_month:'02', start_year:'2022', end_month:'07', end_year:'2023', is_current:false},
    ],
    fam:65, career:74, indep:60, emo:60, soc:60, trad:42, reloc:72, pace:65,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    summary:'A driven, no-nonsense Delhi rheumatology resident with broad preferences and modern outlook. Looking for genuine compatibility regardless of background.',
    quote:'I value character over credentials in a partner.',
    closing:'I am ready to invest in the right relationship.',
    pa_min:25, pa_max:35, ph_min:155, ph_max:172, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['vegetarian','eggetarian','non_vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Ambitious','Good communicator','Kind','Honest','Emotionally mature'],
  },

  // =====================================================================
  // GROUP C: FILLER MALES (indices 20–37)
  // =====================================================================

  { email:'nitin.saxena@demo.samvaya.test', first:'Nitin', last:'Saxena', gender:'male', dob:'1994-02-07',
    state:'Uttar Pradesh', city:'Varanasi', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'A+', height:172, weight:71, siblings:2,
    father_occ:'Government Official', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Classical Music','Reading','Temple Visits','Cooking','Yoga'],
    timeline:'6_to_12_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['General Surgery'], med_status:'completed_pg', total_exp:66,
    work:null, fam:78, career:68, indep:42, emo:55, soc:55, trad:72, reloc:40, pace:52,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    pa_min:26, pa_max:32, ph_min:155, ph_max:165, pref_states:['Uttar Pradesh','Bihar','Rajasthan'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way', qualities:['Traditional','Family-oriented','Humble','Grounded','Caring'],
  },

  { email:'gaurav.tiwari@demo.samvaya.test', first:'Gaurav', last:'Tiwari', gender:'male', dob:'1992-06-21',
    state:'Uttar Pradesh', city:'Kanpur', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English'],
    religious_obs:'culturally_observant', kundali:true, caste_comfort:true, blood:'O+', height:174, weight:74, siblings:1,
    father_occ:'Professor', mother_occ:'School Teacher',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Cricket','Reading','Cooking','Movies','Driving'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Radiology'], med_status:'completed_pg', total_exp:78,
    work:null, fam:68, career:70, indep:55, emo:58, soc:62, trad:55, reloc:58, pace:60,
    comm:'direct', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:27, pa_max:34, ph_min:155, ph_max:168, pref_states:['Uttar Pradesh','Bihar','Madhya Pradesh'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Honest','Caring','Ambitious','Grounded','Family-oriented'],
  },

  { email:'harish.balaji@demo.samvaya.test', first:'Harish', last:'Balaji', gender:'male', dob:'1997-12-04',
    state:'Tamil Nadu', city:'Madurai', religion:'Hindu', tongue:'Tamil', languages:['Tamil','English'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'B+', height:170, weight:66, siblings:2,
    father_occ:'Temple Priest', mother_occ:'Housewife',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Carnatic Music','Reading Scriptures','Cooking','Temple Service','Yoga'],
    timeline:'1_to_2_years', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Orthopedics'], med_status:'pursuing_pg', total_exp:24,
    work:null, fam:85, career:65, indep:38, emo:52, soc:48, trad:82, reloc:35, pace:48,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    pa_min:24, pa_max:30, ph_min:155, ph_max:165, pref_states:['Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way', qualities:['Traditional','Religious','Family-oriented','Humble','Grounded'],
  },

  { email:'santosh.kumar@demo.samvaya.test', first:'Santosh', last:'Kumar', gender:'male', dob:'1989-08-15',
    state:'Andhra Pradesh', city:'Vijayawada', religion:'Hindu', tongue:'Telugu', languages:['Telugu','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:173, weight:75, siblings:1,
    father_occ:'Farmer', mother_occ:'Tailor',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Cricket','Cooking Telugu Food','Gardening','Reading','Family Events'],
    timeline:'within_6_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'open_to_it',
    specialty:['Cardiothoracic Surgery'], med_status:'completed_pg', total_exp:96,
    work:null, fam:72, career:74, indep:50, emo:58, soc:62, trad:55, reloc:60, pace:55,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    pa_min:28, pa_max:36, ph_min:155, ph_max:168, pref_states:['Andhra Pradesh','Telangana','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Hard-working','Honest','Family-oriented','Caring','Grounded'],
  },

  { email:'akshay.naik@demo.samvaya.test', first:'Akshay', last:'Naik', gender:'male', dob:'1995-04-03',
    state:'Goa', city:'Panaji', religion:'Hindu', tongue:'Konkani', languages:['Konkani','English','Hindi','Marathi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:174, weight:72, siblings:1,
    father_occ:'Hotel Owner', mother_occ:'Teacher',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Beach Sports','Cooking Goan Cuisine','Travel','Music','Cycling'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Emergency Medicine'], med_status:'completed_pg', total_exp:60,
    work:null, fam:65, career:70, indep:60, emo:65, soc:72, trad:42, reloc:65, pace:65,
    comm:'expressive', conflict:'addresses_immediately', role:'co_builder', fin:'financially_casual',
    pa_min:26, pa_max:33, ph_min:155, ph_max:170, pref_states:['Goa','Maharashtra','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Energetic','Fun','Kind','Honest','Open-minded'],
  },

  { email:'rajiv.thomas@demo.samvaya.test', first:'Rajiv', last:'Thomas', gender:'male', dob:'1993-10-18',
    state:'Kerala', city:'Kochi', religion:'Christian', tongue:'Malayalam', languages:['Malayalam','English'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:false, blood:'B+', height:176, weight:73, siblings:2,
    father_occ:'Pastor', mother_occ:'Nurse',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Church Activities','Cricket','Reading','Cooking','Volunteering'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Medical Oncology'], med_status:'completed_pg', total_exp:72,
    work:null, fam:72, career:72, indep:52, emo:65, soc:65, trad:55, reloc:65, pace:60,
    comm:'expressive', conflict:'collaborative', role:'flexible', fin:'financially_intentional',
    pa_min:27, pa_max:34, ph_min:155, ph_max:170, pref_states:['Kerala','Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Kind','Caring','Family-oriented','Honest','Supportive'],
  },

  { email:'faiz.rahman@demo.samvaya.test', first:'Faiz', last:'Rahman', gender:'male', dob:'1996-05-26',
    state:'Uttar Pradesh', city:'Allahabad', religion:'Muslim', tongue:'Urdu', languages:['Urdu','Hindi','English'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:false, blood:'O+', height:173, weight:70, siblings:3,
    father_occ:'Urdu Professor', mother_occ:'Homemaker',
    diet:'non_vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Urdu Poetry','Reading','Cooking','Community Work','Travelling'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Pediatrics'], med_status:'pursuing_pg', total_exp:28,
    work:null, fam:72, career:68, indep:52, emo:65, soc:60, trad:62, reloc:62, pace:58,
    comm:'expressive', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:24, pa_max:31, ph_min:155, ph_max:168, pref_states:['Uttar Pradesh','Bihar','Delhi'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['non_vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Kind','Caring','Honest','Family-oriented','Supportive'],
  },

  { email:'pranav.shah@demo.samvaya.test', first:'Pranav', last:'Shah', gender:'male', dob:'1991-07-09',
    state:'Gujarat', city:'Surat', religion:'Jain', tongue:'Gujarati', languages:['Gujarati','Hindi','English'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:true, blood:'A+', height:172, weight:69, siblings:1,
    father_occ:'Diamond Merchant', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Business Reading','Yoga','Family Events','Jain Pilgrimage','Cooking'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Dermatology'], med_status:'completed_pg', total_exp:84,
    work:null, fam:86, career:68, indep:38, emo:55, soc:62, trad:80, reloc:38, pace:48,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    pa_min:28, pa_max:35, ph_min:155, ph_max:165, pref_states:['Gujarat'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way', qualities:['Traditional','Religious','Family-oriented','Financially responsible','Humble'],
  },

  { email:'tanmay.banerjee@demo.samvaya.test', first:'Tanmay', last:'Banerjee', gender:'male', dob:'1998-03-13',
    state:'West Bengal', city:'Kolkata', religion:'Hindu', tongue:'Bengali', languages:['Bengali','English','Hindi'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'B-', height:172, weight:66, siblings:1,
    father_occ:'Journalist', mother_occ:'Doctor',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading Bengali Literature','Films','Travel','Writing','Coffee Conversations'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'open_to_it',
    specialty:['Psychiatry'], med_status:'pursuing_pg', total_exp:22,
    work:null, fam:60, career:68, indep:65, emo:72, soc:58, trad:38, reloc:68, pace:62,
    comm:'expressive', conflict:'reflects_first', role:'co_builder', fin:'financially_casual',
    pa_min:24, pa_max:31, ph_min:155, ph_max:170, pref_states:['West Bengal','Odisha'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Intellectually curious','Emotionally mature','Open-minded','Creative','Kind'],
  },

  { email:'ishaan.choudhary@demo.samvaya.test', first:'Ishaan', last:'Choudhary', gender:'male', dob:'1994-12-01',
    state:'Rajasthan', city:'Jodhpur', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English','Rajasthani'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:true, blood:'O+', height:177, weight:76, siblings:2,
    father_occ:'Businessman', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Polo','Trekking','Reading','Cooking Rajasthani Food','Cricket'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Urology'], med_status:'completed_pg', total_exp:66,
    work:null, fam:74, career:72, indep:52, emo:60, soc:60, trad:58, reloc:60, pace:58,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    pa_min:26, pa_max:33, ph_min:155, ph_max:168, pref_states:['Rajasthan','Gujarat','Delhi'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Grounded','Honest','Family-oriented','Ambitious','Kind'],
  },

  { email:'yash.deshpande@demo.samvaya.test', first:'Yash', last:'Deshpande', gender:'male', dob:'1996-07-17',
    state:'Maharashtra', city:'Nagpur', religion:'Hindu', tongue:'Marathi', languages:['Marathi','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:173, weight:70, siblings:1,
    father_occ:'Engineer', mother_occ:'Principal',
    diet:'vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Cricket','Cooking','Reading','Travel','Movies'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Gastroenterology'], med_status:'pursuing_pg', total_exp:26,
    work:null, fam:68, career:72, indep:55, emo:62, soc:65, trad:48, reloc:62, pace:58,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_casual',
    pa_min:25, pa_max:31, ph_min:155, ph_max:168, pref_states:['Maharashtra','Madhya Pradesh'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Honest','Kind','Ambitious','Family-oriented','Energetic'],
  },

  { email:'parth.trivedi@demo.samvaya.test', first:'Parth', last:'Trivedi', gender:'male', dob:'1990-11-24',
    state:'Gujarat', city:'Vadodara', religion:'Hindu', tongue:'Gujarati', languages:['Gujarati','Hindi','English'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'B+', height:174, weight:72, siblings:2,
    father_occ:'Textile Manufacturer', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Yoga','Family Business','Community Events','Badminton','Religious Readings'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'3_or_more', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Nephrology'], med_status:'completed_pg', total_exp:90,
    work:null, fam:88, career:65, indep:36, emo:55, soc:65, trad:78, reloc:35, pace:48,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    pa_min:28, pa_max:35, ph_min:155, ph_max:165, pref_states:['Gujarat'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way', qualities:['Traditional','Religious','Financially responsible','Family-oriented','Grounded'],
  },

  { email:'kiran.hegde@demo.samvaya.test', first:'Kiran', last:'Hegde', gender:'male', dob:'1997-09-11',
    state:'Karnataka', city:'Mangalore', religion:'Hindu', tongue:'Tulu', languages:['Tulu','Kannada','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:172, weight:67, siblings:1,
    father_occ:'Businessman', mother_occ:'Doctor',
    diet:'non_vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Football','Cooking Coastal Food','Travel','Reading','Fitness'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['ENT (Otorhinolaryngology)'], med_status:'pursuing_pg', total_exp:24,
    work:null, fam:68, career:70, indep:58, emo:60, soc:65, trad:45, reloc:68, pace:62,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    pa_min:24, pa_max:31, ph_min:155, ph_max:168, pref_states:['Karnataka','Kerala','Goa'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Kind','Honest','Energetic','Ambitious','Family-oriented'],
  },

  { email:'saurabh.kulkarni@demo.samvaya.test', first:'Saurabh', last:'Kulkarni', gender:'male', dob:'1993-05-28',
    state:'Maharashtra', city:'Aurangabad', religion:'Hindu', tongue:'Marathi', languages:['Marathi','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:173, weight:72, siblings:1,
    father_occ:'Government Officer', mother_occ:'Teacher',
    diet:'eggetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Photography','Travel','Reading Marathi Literature','Cooking','Badminton'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Ophthalmology'], med_status:'completed_pg', total_exp:72,
    work:null, fam:68, career:70, indep:58, emo:62, soc:60, trad:48, reloc:62, pace:60,
    comm:'direct', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:27, pa_max:34, ph_min:155, ph_max:168, pref_states:['Maharashtra','Goa'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['eggetarian','vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Creative','Caring','Honest','Ambitious','Grounded'],
  },

  { email:'nihal.fernandes@demo.samvaya.test', first:'Nihal', last:'Fernandes', gender:'male', dob:'1995-01-16',
    state:'Goa', city:'Panaji', religion:'Christian', tongue:'Konkani', languages:['Konkani','English','Marathi','Hindi'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:false, blood:'O+', height:175, weight:71, siblings:2,
    father_occ:'Fisherman', mother_occ:'Nurse',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Church Activities','Football','Beach Volleyball','Cooking','Travelling'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['General Medicine'], med_status:'completed_pg', total_exp:60,
    work:null, fam:65, career:68, indep:60, emo:65, soc:70, trad:45, reloc:65, pace:65,
    comm:'expressive', conflict:'collaborative', role:'flexible', fin:'financially_casual',
    pa_min:26, pa_max:33, ph_min:155, ph_max:170, pref_states:['Goa','Maharashtra','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Fun','Kind','Honest','Caring','Open-minded'],
  },

  { email:'adishwar.kumar@demo.samvaya.test', first:'Adishwar', last:'Kumar', gender:'male', dob:'1998-08-02',
    state:'Bihar', city:'Patna', religion:'Hindu', tongue:'Maithili', languages:['Maithili','Hindi','English'],
    religious_obs:'culturally_observant', kundali:true, caste_comfort:true, blood:'B+', height:170, weight:65, siblings:3,
    father_occ:'Farmer', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading','Yoga','Community Service','Cooking','Cricket'],
    timeline:'1_to_2_years', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Community Medicine'], med_status:'pursuing_pg', total_exp:20,
    work:null, fam:78, career:62, indep:42, emo:55, soc:52, trad:68, reloc:58, pace:50,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    pa_min:23, pa_max:29, ph_min:155, ph_max:165, pref_states:['Bihar','Jharkhand','Uttar Pradesh'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way', qualities:['Humble','Hard-working','Family-oriented','Traditional','Caring'],
  },

  { email:'ritesh.nanda@demo.samvaya.test', first:'Ritesh', last:'Nanda', gender:'male', dob:'1992-04-09',
    state:'Delhi', city:'New Delhi', religion:'Hindu', tongue:'Punjabi', languages:['Punjabi','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:176, weight:76, siblings:1,
    father_occ:'Senior Government Doctor', mother_occ:'Doctor (Paediatrician)',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Gym','Travel','Cooking','Reading','Delhi NCR Socialising'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Pathology'], med_status:'completed_pg', total_exp:84,
    work:null, fam:65, career:72, indep:60, emo:60, soc:68, trad:42, reloc:65, pace:65,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    pa_min:27, pa_max:34, ph_min:155, ph_max:170, pref_states:['Delhi','Haryana','Punjab'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Ambitious','Honest','Energetic','Kind','Good communicator'],
  },

  { email:'varun.pillai@demo.samvaya.test', first:'Varun', last:'Pillai', gender:'male', dob:'1994-10-20',
    state:'Kerala', city:'Thrissur', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Tamil'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:175, weight:70, siblings:1,
    father_occ:'Engineer', mother_occ:'Bank Manager',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Kathakali','Reading','Cooking','Travel','Classical Music'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Cardiology'], med_status:'completed_pg', total_exp:66,
    work:null, fam:74, career:70, indep:55, emo:65, soc:55, trad:45, reloc:65, pace:60,
    comm:'indirect', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:26, pa_max:32, ph_min:155, ph_max:168, pref_states:['Kerala','Karnataka','Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Grounded','Kind','Humble','Caring','Emotionally mature'],
  },

  // =====================================================================
  // GROUP D: DELIBERATE PAIR FEMALES (indices 38–52, paired with 0–14)
  // =====================================================================

  { // 38 ↔ 0 · target 88
    email:'priya.krishnaswamy@demo.samvaya.test', first:'Priya', last:'Krishnaswamy', gender:'female', dob:'1996-07-18',
    state:'Kerala', city:'Kochi', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:163, weight:56, siblings:1,
    father_occ:'Retired Cardiologist', mother_occ:'Retired Principal',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Yoga','Reading','Classical Dance (Mohiniyattam)','Travel','Photography'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Cardiology'], med_status:'completed_pg', total_exp:66,
    work:[
      {org_name:'KIMS Hospital, Thiruvananthapuram', designation:'Consultant Cardiologist', start_month:'03', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Amrita Institute, Kochi', designation:'Senior Resident', start_month:'07', start_year:'2019', end_month:'02', end_year:'2021', is_current:false},
    ],
    fam:80, career:82, indep:62, emo:72, soc:60, trad:40, reloc:70, pace:63,
    fam_n:'Values family deeply; close to parents and sibling; open to building her own.',
    career_n:'Passionate cardiologist following in her father\'s footsteps with her own identity.',
    indep_n:'Values personal space and also deeply values shared life.',
    emo_n:'Emotionally articulate; expresses thoughts clearly and honestly.',
    soc_n:'Selectively social; chooses depth over breadth in friendships.',
    trad_n:'Progressive with deep cultural respect.',
    reloc_n:'Open to any South Indian metro; broader India possible.',
    pace_n:'Balances demanding cardiac work with intentional self-care.',
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    summary:"A warm, intellectually sharp cardiologist from Kochi who values authentic connection and mutual ambition. Carries her father's legacy with her own identity.",
    quote:"I want someone who challenges me to be better and celebrates who I already am.",
    closing:"I believe the right relationship is built on honesty, respect, and shared dreams.",
    pa_min:28, pa_max:35, ph_min:168, ph_max:185, pref_states:['Kerala','Karnataka','Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Ambitious','Kind','Emotionally mature','Family-oriented','Good communicator'],
  },

  { // 39 ↔ 1 · target 85
    email:'aishwarya.rao@demo.samvaya.test', first:'Aishwarya', last:'Rao', gender:'female', dob:'1995-12-09',
    state:'Karnataka', city:'Bangalore', religion:'Hindu', tongue:'Kannada', languages:['Kannada','English','Hindi'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'B+', height:162, weight:54, siblings:0,
    father_occ:'Senior Software Engineer', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading (Neuroscience & Philosophy)','Writing','Hiking','Coffee Conversations','Art'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Psychiatry'], med_status:'completed_pg', total_exp:72,
    work:[
      {org_name:'NIMHANS, Bangalore', designation:'Consultant Psychiatrist', start_month:'04', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Victoria Hospital, Bangalore', designation:'Senior Resident', start_month:'07', start_year:'2019', end_month:'03', end_year:'2021', is_current:false},
    ],
    fam:72, career:80, indep:65, emo:62, soc:55, trad:38, reloc:75, pace:70,
    fam_n:'Values family warmly but has built a very independent life.',
    career_n:'Highly ambitious psychiatrist with academic research ambitions.',
    indep_n:'Strongly values personal space; looks for a relationship of equals.',
    emo_n:'Thoughtful and measured; processes deeply before sharing.',
    soc_n:'Quiet social life; deeply selective about her inner circle.',
    trad_n:'Very progressive; completely open to different backgrounds.',
    reloc_n:'Very open to relocation; excited by new cities.',
    pace_n:'Fast-thinking professional with a structured approach to life.',
    comm:'direct', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    summary:"A deeply reflective, intellectually driven psychiatrist with a quiet intensity and high ambitions. Seeks a partner who matches her intellectual curiosity and emotional depth.",
    quote:"Depth is what matters to me. In conversations, in relationships, in life.",
    closing:"I approach this thoughtfully. I am looking for something real and lasting.",
    pa_min:28, pa_max:36, ph_min:168, ph_max:188, pref_states:['Karnataka','Kerala','Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Intellectually curious','Ambitious','Emotionally mature','Independent','Kind'],
  },

  { // 40 ↔ 2 · target 82
    email:'sneha.patil@demo.samvaya.test', first:'Sneha', last:'Patil', gender:'female', dob:'1997-05-24',
    state:'Maharashtra', city:'Mumbai', religion:'Hindu', tongue:'Marathi', languages:['Marathi','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:160, weight:52, siblings:1,
    father_occ:'Doctor (Surgeon)', mother_occ:'Teacher',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Zumba','Travel','Cooking','Reading Fiction','Mumbai Socialising'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Dermatology'], med_status:'pursuing_pg', total_exp:30,
    work:[
      {org_name:'Lokmanya Tilak Municipal General Hospital, Mumbai', designation:'Junior Dermatology Resident', start_month:'02', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Grant Medical College, Mumbai', designation:'House Surgeon', start_month:'08', start_year:'2021', end_month:'01', end_year:'2023', is_current:false},
    ],
    fam:70, career:72, indep:58, emo:68, soc:68, trad:45, reloc:62, pace:62,
    fam_n:'Values family; raised in a medical family and comfortable with its demands.',
    career_n:'Enthusiastic dermatology resident with aesthetic medicine ambitions.',
    indep_n:'Comfortable with interdependence; values genuine closeness.',
    emo_n:'Warm and expressive; handles feelings directly.',
    soc_n:'Socially active Mumbai doctor; large friend circle.',
    trad_n:'Modern Mumbaikar; respects Maharashtrian culture.',
    reloc_n:'Open to staying in Maharashtra or exploring new cities.',
    pace_n:'Energetic; balances residency with an active personal life.',
    comm:'expressive', conflict:'addresses_immediately', role:'co_builder', fin:'financially_casual',
    summary:"A warm, energetic Mumbai dermatology resident with a vibrant social life and genuine directness. Seeks a partner who is equally real and growth-oriented.",
    quote:"I want someone who keeps up and keeps it real.",
    closing:"I am ready for the next chapter — looking for someone who is too.",
    pa_min:25, pa_max:32, ph_min:168, ph_max:185, pref_states:['Maharashtra','Goa','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Energetic','Kind','Honest','Ambitious','Family-oriented'],
  },

  { // 41 ↔ 3 · target 86
    email:'kavitha.sundaram@demo.samvaya.test', first:'Kavitha', last:'Sundaram', gender:'female', dob:'1994-09-03',
    state:'Tamil Nadu', city:'Chennai', religion:'Hindu', tongue:'Tamil', languages:['Tamil','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:true, blood:'B+', height:161, weight:54, siblings:2,
    father_occ:'Retired IAS Officer', mother_occ:'Doctor (Gynaecologist)',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Bharatanatyam','Reading','Carnatic Concerts','Cooking','Yoga'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['General Surgery'], med_status:'completed_pg', total_exp:60,
    work:[
      {org_name:'Madras Medical College, Chennai', designation:'Consultant General Surgeon', start_month:'07', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Government Stanley Hospital, Chennai', designation:'Senior Resident', start_month:'01', start_year:'2019', end_month:'06', end_year:'2021', is_current:false},
    ],
    fam:82, career:76, indep:50, emo:68, soc:58, trad:58, reloc:58, pace:60,
    fam_n:'Deeply rooted in family values; daughter of a distinguished family.',
    career_n:'Accomplished surgeon; values precision and professional integrity.',
    indep_n:'Values strong companionship; partnership is central to how she lives.',
    emo_n:'Warm and caring; expresses feelings clearly in trusted relationships.',
    soc_n:'Moderate social life; selectively social in Chennai\'s professional circles.',
    trad_n:'Culturally Tamil with pride; balances tradition and modern outlook.',
    reloc_n:'Open to South India for the right partner.',
    pace_n:'Measured and purposeful in pace; values structure in daily life.',
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:"A cultured, accomplished Tamil surgeon who blends professional excellence with deep family values. Seeks a steady, respectful partnership built on equality.",
    quote:"I want a partner who respects tradition and builds something new at the same time.",
    closing:"I believe in the institution of marriage and I approach this with full sincerity.",
    pa_min:27, pa_max:34, ph_min:168, ph_max:185, pref_states:['Tamil Nadu','Kerala','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Family-oriented','Humble','Caring','Grounded','Emotionally mature'],
  },

  { // 42 ↔ 4 · target 89
    email:'meera.shah@demo.samvaya.test', first:'Meera', last:'Shah', gender:'female', dob:'1993-04-17',
    state:'Gujarat', city:'Ahmedabad', religion:'Hindu', tongue:'Gujarati', languages:['Gujarati','Hindi','English'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'A+', height:159, weight:52, siblings:1,
    father_occ:'Eye Surgeon', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Garba','Classical Music','Cooking Gujarati Food','Family Events','Yoga'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Ophthalmology'], med_status:'completed_pg', total_exp:78,
    work:[
      {org_name:'Aravind Eye Hospital, Ahmedabad', designation:'Senior Ophthalmologist', start_month:'05', start_year:'2020', end_month:'', end_year:'', is_current:true},
      {org_name:'L.G. Hospital, Ahmedabad', designation:'Senior Resident', start_month:'07', start_year:'2018', end_month:'04', end_year:'2020', is_current:false},
    ],
    fam:86, career:70, indep:43, emo:60, soc:67, trad:74, reloc:48, pace:57,
    fam_n:'Family is everything; grew up in a warm joint family and values it deeply.',
    career_n:'Established ophthalmologist following her father\'s footsteps.',
    indep_n:'Strongly values togetherness; very family-and-partner oriented.',
    emo_n:'Warm and caring; expresses love through action and service.',
    soc_n:'Socially active in the Gujarati community.',
    trad_n:'Deeply traditional Gujarati; values ceremonies, culture, and community.',
    reloc_n:'Prefers Ahmedabad or Gujarat; deeply rooted.',
    pace_n:'Content and steady; finds joy in family and routines.',
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:"A warm, deeply traditional Gujarati ophthalmologist with a rich family life and community-centred values. Seeks a partner who shares her love of culture, togetherness, and building a joint family.",
    quote:"A happy home is my greatest ambition. Everything else follows from that.",
    closing:"I want a partner who values what my family values: warmth, togetherness, and commitment.",
    pa_min:28, pa_max:36, ph_min:168, ph_max:185, pref_states:['Gujarat','Rajasthan','Maharashtra'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way',
    qualities:['Family-oriented','Traditional','Caring','Grounded','Financially responsible'],
  },

  { // 43 ↔ 5 · target 83
    email:'divya.tripathi@demo.samvaya.test', first:'Divya', last:'Tripathi', gender:'female', dob:'1998-10-31',
    state:'Uttar Pradesh', city:'Lucknow', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'O+', height:161, weight:53, siblings:1,
    father_occ:'Professor', mother_occ:'School Teacher',
    diet:'eggetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading','Writing Short Stories','Dance','Meditation','Travel'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Pediatrics'], med_status:'pursuing_pg', total_exp:26,
    work:[
      {org_name:'King George Medical University, Lucknow', designation:'Junior Paediatrics Resident', start_month:'08', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Ram Manohar Lohia Hospital, Lucknow', designation:'House Surgeon', start_month:'02', start_year:'2022', end_month:'07', end_year:'2023', is_current:false},
    ],
    fam:72, career:70, indep:60, emo:78, soc:65, trad:42, reloc:70, pace:60,
    fam_n:'Values family warmly while building her own independent identity.',
    career_n:'Passionate about paediatrics and child health advocacy.',
    indep_n:'Comfortable with interdependence; values emotional intimacy.',
    emo_n:'Highly expressive; wears her heart on her sleeve.',
    soc_n:'Warm and socially comfortable; connects easily with new people.',
    trad_n:'Progressive North Indian; respectful of culture without constraints.',
    reloc_n:'Open to relocation; excited about new opportunities.',
    pace_n:'Thoughtful and balanced; creative pursuits ground her.',
    comm:'expressive', conflict:'collaborative', role:'co_builder', fin:'financially_intentional',
    summary:"A warm, emotionally expressive paediatrics resident with a creative inner life and genuine care for people. Seeks a thoughtful, emotionally present partner.",
    quote:"I want someone who feels things deeply and isn't afraid to show it.",
    closing:"I am looking for a real connection — someone who values growth and emotional honesty.",
    pa_min:24, pa_max:30, ph_min:168, ph_max:185, pref_states:['Uttar Pradesh','Delhi','Rajasthan'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['eggetarian','vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Emotionally mature','Kind','Intellectually curious','Supportive','Open-minded'],
  },

  { // 44 ↔ 6 · target 87
    email:'nandini.joshi@demo.samvaya.test', first:'Nandini', last:'Joshi', gender:'female', dob:'1992-06-14',
    state:'Rajasthan', city:'Jaipur', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English','Rajasthani'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'A+', height:160, weight:55, siblings:1,
    father_occ:'Judge (High Court)', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Classical Singing','Temple Visits','Cooking','Reading','Embroidery'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Neurology'], med_status:'completed_pg', total_exp:84,
    work:[
      {org_name:'Sawai Man Singh Medical College, Jaipur', designation:'Consultant Neurologist', start_month:'07', start_year:'2019', end_month:'', end_year:'', is_current:true},
      {org_name:'Fortis Escorts, Jaipur', designation:'Senior Resident', start_month:'01', start_year:'2018', end_month:'06', end_year:'2019', is_current:false},
    ],
    fam:82, career:76, indep:45, emo:58, soc:52, trad:70, reloc:50, pace:53,
    fam_n:'Family is the centre of her life; deeply rooted in Rajasthani values.',
    career_n:'Accomplished neurologist with academic standing in Jaipur.',
    indep_n:'Values togetherness strongly; sees marriage as a complete union.',
    emo_n:'Reserved but deeply warm with family; carefully expressive.',
    soc_n:'Quiet social life; prioritises family and close friendships.',
    trad_n:'Traditional Rajasthani; deeply proud of culture and customs.',
    reloc_n:'Prefers to remain in Jaipur or Rajasthan.',
    pace_n:'Steady, content pace; values meaningful daily routines.',
    comm:'reserved', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:"An accomplished, traditional Rajasthani neurologist from a distinguished family. Values her culture, rituals, and the warmth of a deeply rooted family life.",
    quote:"I want the kind of home where generations feel welcome.",
    closing:"I am ready for marriage and seeking someone who shares my values deeply.",
    pa_min:29, pa_max:37, ph_min:170, ph_max:188, pref_states:['Rajasthan','Uttar Pradesh','Delhi'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way',
    qualities:['Traditional','Family-oriented','Financially responsible','Grounded','Humble'],
  },

  { // 45 ↔ 7 · target 79
    email:'swathi.reddy@demo.samvaya.test', first:'Swathi', last:'Reddy', gender:'female', dob:'1997-11-08',
    state:'Telangana', city:'Hyderabad', religion:'Hindu', tongue:'Telugu', languages:['Telugu','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:162, weight:55, siblings:2,
    father_occ:'IT Professional', mother_occ:'Doctor (Dermatologist)',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Kuchipudi','Travel','Photography','Reading','Social Media'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'open_to_it',
    specialty:['Radiology'], med_status:'pursuing_pg', total_exp:28,
    work:[
      {org_name:'Osmania General Hospital, Hyderabad', designation:'Junior Radiology Resident', start_month:'01', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Care Hospital, Hyderabad', designation:'House Surgeon', start_month:'06', start_year:'2021', end_month:'12', end_year:'2022', is_current:false},
    ],
    fam:68, career:75, indep:40, emo:65, soc:70, trad:52, reloc:68, pace:62,
    fam_n:'Values family warmly; wants partnership to be emotionally close.',
    career_n:'Driven radiology resident; interested in interventional subspecialisation.',
    indep_n:'Strongly values togetherness and emotional proximity in a relationship.',
    emo_n:'Expressive and open; comfortable communicating feelings.',
    soc_n:'Socially active; thrives in Hyderabad\'s vibrant professional scene.',
    trad_n:'Culturally aware Telugu; modern in personal outlook.',
    reloc_n:'Open to Hyderabad or broader South India.',
    pace_n:'Energetic; balances training with an active social life.',
    comm:'expressive', conflict:'reflects_first', role:'flexible', fin:'financially_casual',
    summary:"An expressive, career-driven Hyderabad radiologist who deeply values emotional closeness in a relationship. Seeks a partner who can match her energy and provide genuine companionship.",
    quote:"I want someone to come home to at the end of a tough day.",
    closing:"I'm ready for the real thing and I know what I'm looking for.",
    pa_min:26, pa_max:32, ph_min:168, ph_max:185, pref_states:['Telangana','Andhra Pradesh','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Emotionally mature','Kind','Energetic','Honest','Family-oriented'],
  },

  { // 46 ↔ 8 · target 84
    email:'pooja.nair@demo.samvaya.test', first:'Pooja', last:'Nair', gender:'female', dob:'1994-04-26',
    state:'Tamil Nadu', city:'Coimbatore', religion:'Hindu', tongue:'Tamil', languages:['Tamil','English','Malayalam'],
    religious_obs:'spiritually_observant', kundali:false, caste_comfort:false, blood:'O+', height:160, weight:54, siblings:1,
    father_occ:'Retired Colonel', mother_occ:'Doctor (Physician)',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Half Marathons','Reading','Yoga','Cooking','Classical Music'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Cardiology'], med_status:'completed_pg', total_exp:66,
    work:[
      {org_name:'Kovai Medical Centre, Coimbatore', designation:'Consultant Cardiologist', start_month:'08', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'PSG Hospitals, Coimbatore', designation:'Senior Resident', start_month:'01', start_year:'2019', end_month:'07', end_year:'2021', is_current:false},
    ],
    fam:78, career:74, indep:58, emo:65, soc:52, trad:42, reloc:68, pace:62,
    fam_n:'Deep family bonds; grew up in a disciplined yet warm Army household.',
    career_n:'Accomplished cardiologist with strong clinical reputation.',
    indep_n:'Balanced; comfortable with both personal space and closeness.',
    emo_n:'Direct and grounded emotionally; values steady communication.',
    soc_n:'Quiet social life; closest friends from medical school.',
    trad_n:'Progressive outlook; respects cultural roots without constraints.',
    reloc_n:'Open to South Indian cities; broader India possible.',
    pace_n:'Disciplined runner\'s mindset applied to life and relationships.',
    comm:'direct', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    summary:"A disciplined, warm Tamil cardiologist with a marathoner's steady commitment. Brings the same patience and endurance to relationships that she brings to her 21K runs.",
    quote:"I want a steady, strong partnership — like a good long run.",
    closing:"I am grounded, ready, and looking for someone with similar depth.",
    pa_min:28, pa_max:35, ph_min:168, ph_max:185, pref_states:['Tamil Nadu','Kerala','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Grounded','Kind','Emotionally mature','Health-conscious','Family-oriented'],
  },

  { // 47 ↔ 9 · target 91 — the showcase pair
    email:'harpreet.kaur@demo.samvaya.test', first:'Harpreet', last:'Kaur', gender:'female', dob:'1991-08-12',
    state:'Punjab', city:'Chandigarh', religion:'Sikh', tongue:'Punjabi', languages:['Punjabi','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:165, weight:60, siblings:1,
    father_occ:'Senior Police Officer', mother_occ:'Principal',
    diet:'non_vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Kabaddi (coaching)','Cooking Punjabi Food','Community Service','Travel','Bhangra'],
    timeline:'within_6_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'open_to_it',
    specialty:['Orthopedics'], med_status:'completed_pg', total_exp:90,
    work:[
      {org_name:'PGI Chandigarh', designation:'Consultant Orthopaedic Surgeon', start_month:'06', start_year:'2019', end_month:'', end_year:'', is_current:true},
      {org_name:'Fortis Hospital, Mohali', designation:'Senior Resident', start_month:'07', start_year:'2017', end_month:'05', end_year:'2019', is_current:false},
    ],
    fam:86, career:78, indep:50, emo:70, soc:72, trad:64, reloc:56, pace:60,
    fam_n:'Family and community are at the heart of everything she does.',
    career_n:'Highly accomplished orthopaedic surgeon; respected at PGI.',
    indep_n:'Values closeness and togetherness; deep partnership is her goal.',
    emo_n:'Warm and openly expressive; completely comfortable sharing feelings.',
    soc_n:'Highly social; brings people together naturally.',
    trad_n:'Culturally Sikh with deep pride; progressive in personal values.',
    reloc_n:'Open to relocation; home is where family is.',
    pace_n:'Energetic; brings big energy to work, family, and community.',
    comm:'expressive', conflict:'collaborative', role:'co_builder', fin:'financially_intentional',
    summary:"A warm, accomplished Punjabi orthopaedic surgeon with enormous heart, high energy, and a deeply communal spirit. The kind of person who fills every room with life.",
    quote:"I want a partner who loves as fully as I do — in every way.",
    closing:"I have everything I need. I just want to share it with the right person.",
    pa_min:30, pa_max:38, ph_min:172, ph_max:192, pref_states:['Punjab','Delhi','Haryana'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Family-oriented','Warm','Emotionally mature','Supportive','Grounded'],
  },

  { // 48 ↔ 10 · target 82
    email:'anjali.singh@demo.samvaya.test', first:'Anjali', last:'Singh', gender:'female', dob:'1996-03-07',
    state:'Delhi', city:'New Delhi', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English','Punjabi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:162, weight:56, siblings:1,
    father_occ:'Army Doctor (Colonel)', mother_occ:'Homemaker',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Classical Dance (Kathak)','Reading','Theatre','Cooking','Running'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['General Medicine'], med_status:'completed_pg', total_exp:60,
    work:[
      {org_name:'AIIMS Delhi', designation:'Senior Resident (General Medicine)', start_month:'07', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Safdarjung Hospital, Delhi', designation:'Junior Resident', start_month:'01', start_year:'2019', end_month:'06', end_year:'2021', is_current:false},
    ],
    fam:76, career:75, indep:58, emo:62, soc:60, trad:38, reloc:68, pace:60,
    fam_n:'Values family deeply; close to parents; looking to build her own.',
    career_n:'AIIMS-trained physician with clear clinical and academic goals.',
    indep_n:'Comfortable with both personal space and closeness in a relationship.',
    emo_n:'Direct and clear in emotional expression; addresses things promptly.',
    soc_n:'Selectively social; deep-over-broad preference in friendships.',
    trad_n:'Modern Delhi professional who respects family values.',
    reloc_n:'Open to Delhi NCR or beyond for the right person.',
    pace_n:'Structured and purposeful; makes time for both career and personal growth.',
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    summary:"A grounded, purposeful AIIMS physician from a disciplined Army-doctor family. Brings clarity, warmth, and genuine ambition to everything she does.",
    quote:"I want someone who brings the same clarity of purpose to our relationship as I do.",
    closing:"I am ready and looking for someone serious about building something meaningful.",
    pa_min:26, pa_max:33, ph_min:168, ph_max:185, pref_states:['Delhi','Haryana','Uttar Pradesh'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Ambitious','Honest','Kind','Emotionally mature','Family-oriented'],
  },

  { // 49 ↔ 11 · target 76
    email:'lakshmi.varma@demo.samvaya.test', first:'Lakshmi', last:'Varma', gender:'female', dob:'1999-12-15',
    state:'Kerala', city:'Thiruvananthapuram', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Tamil'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'O+', height:158, weight:50, siblings:1,
    father_occ:'Engineer', mother_occ:'Doctor (Anaesthesiologist)',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Painting','Reading','Volunteering at Rural Health Camps','Cooking','Cycling'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'yes_absolutely',
    specialty:['Anesthesiology'], med_status:'pursuing_pg', total_exp:22,
    work:[
      {org_name:'SAT Hospital, Thiruvananthapuram', designation:'Junior Anaesthesia Resident', start_month:'08', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Government Medical College, Thiruvananthapuram', designation:'House Surgeon', start_month:'02', start_year:'2022', end_month:'07', end_year:'2023', is_current:false},
    ],
    fam:70, career:72, indep:62, emo:68, soc:58, trad:40, reloc:82, pace:68,
    fam_n:'Warm family values; following mother\'s footsteps into anaesthesia.',
    career_n:'Motivated young resident with clear specialty ambition.',
    indep_n:'Values both independence and emotional closeness equally.',
    emo_n:'Expressive and warm; comfortable addressing feelings quickly.',
    soc_n:'Moderate social preferences; meaningful connections over many.',
    trad_n:'Progressive Kerala student; open to all backgrounds.',
    reloc_n:'Highly open to relocation; excited by possibilities.',
    pace_n:'Balanced; makes room for creative and social pursuits.',
    comm:'expressive', conflict:'addresses_immediately', role:'flexible', fin:'financially_intentional',
    summary:"A young, open-hearted Kerala anaesthesia resident with artistic sensibilities and an adventurous approach to life. Fully open to where life leads.",
    quote:"I'm at the beginning of everything — my career, my life, and hopefully love.",
    closing:"I approach this with total openness and sincerity.",
    pa_min:24, pa_max:30, ph_min:165, ph_max:182, pref_states:['Kerala','Tamil Nadu','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue',
    qualities:['Open-minded','Creative','Kind','Adventurous','Caring'],
  },

  { // 50 ↔ 12 · target 80
    email:'riya.malhotra@demo.samvaya.test', first:'Riya', last:'Malhotra', gender:'female', dob:'1995-06-28',
    state:'Haryana', city:'Gurugram', religion:'Hindu', tongue:'Hindi', languages:['Hindi','Punjabi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:163, weight:57, siblings:1,
    father_occ:'Senior Corporate Lawyer', mother_occ:'Doctor (Gynaecologist)',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Gym','Travel','Cooking','Music Festivals','Reading'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Obstetrics & Gynecology'], med_status:'completed_pg', total_exp:66,
    work:[
      {org_name:'Medanta Hospital, Gurugram', designation:'Consultant Gynaecologist', start_month:'04', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'Max Hospital, Gurugram', designation:'Senior Resident', start_month:'07', start_year:'2019', end_month:'03', end_year:'2021', is_current:false},
    ],
    fam:72, career:74, indep:60, emo:68, soc:70, trad:48, reloc:62, pace:65,
    fam_n:'Values family; has a modern, warm approach to building her own home.',
    career_n:'Established gynaecologist with strong practice and patient base.',
    indep_n:'Balanced; values both personal space and genuine togetherness.',
    emo_n:'Direct and warm; prefers addressing things head-on.',
    soc_n:'Socially active; confident in professional and social settings.',
    trad_n:'Modern NCR professional with grounded family values.',
    reloc_n:'Open to NCR or new cities for the right relationship.',
    pace_n:'Active and engaged lifestyle; fits a lot into her schedule.',
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_casual',
    summary:"A confident, active Gurugram gynaecologist with social grace and genuine ambition. Seeks a partner who can keep up with her energy and matches her authenticity.",
    quote:"I want a partner who makes life more interesting, not just more comfortable.",
    closing:"I'm ready for a real partnership — in every sense of the word.",
    pa_min:27, pa_max:34, ph_min:168, ph_max:187, pref_states:['Haryana','Delhi','Punjab'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian','vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Ambitious','Good communicator','Energetic','Kind','Honest'],
  },

  { // 51 ↔ 13 · target 88
    email:'shreya.kulkarni@demo.samvaya.test', first:'Shreya', last:'Kulkarni', gender:'female', dob:'1993-02-11',
    state:'Maharashtra', city:'Pune', religion:'Hindu', tongue:'Marathi', languages:['Marathi','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:true, blood:'B+', height:160, weight:53, siblings:2,
    father_occ:'Retired Professor', mother_occ:'Doctor (Pathologist)',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Classical Music (Hindustani)','Reading','Cooking','Walking','Art'],
    timeline:'within_6_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Pathology'], med_status:'completed_pg', total_exp:84,
    work:[
      {org_name:'Deenanath Mangeshkar Hospital, Pune', designation:'Senior Pathologist', start_month:'05', start_year:'2019', end_month:'', end_year:'', is_current:true},
      {org_name:'Sassoon General Hospital, Pune', designation:'Senior Resident', start_month:'07', start_year:'2017', end_month:'04', end_year:'2019', is_current:false},
    ],
    fam:84, career:70, indep:45, emo:60, soc:60, trad:67, reloc:48, pace:53,
    fam_n:'Family is the heart of her life; deeply attached to her Pune roots.',
    career_n:'Respected pathologist following her mother\'s footsteps with her own identity.',
    indep_n:'Values togetherness deeply; seeks a close, committed partnership.',
    emo_n:'Measured in emotional expression; very warm with family.',
    soc_n:'Moderate social life; prefers depth over breadth.',
    trad_n:'Traditional Maharashtrian values with a modern professional life.',
    reloc_n:'Strongly prefers Pune; very rooted.',
    pace_n:'Steady and content; values structure and meaningful routines.',
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:"A deeply rooted, quietly accomplished Pune pathologist with rich cultural values and a warm family orientation. Seeks a steady, traditional partnership in Pune.",
    quote:"I want a quiet, deep love — built slowly and made to last.",
    closing:"I am ready and looking for the right person to build a life with in Pune.",
    pa_min:28, pa_max:36, ph_min:168, ph_max:185, pref_states:['Maharashtra','Goa','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Family-oriented','Traditional','Grounded','Caring','Humble'],
  },

  { // 52 ↔ 14 · target 77
    email:'aditi.menon@demo.samvaya.test', first:'Aditi', last:'Menon', gender:'female', dob:'1998-04-19',
    state:'Kerala', city:'Kozhikode', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Tamil'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'O+', height:159, weight:51, siblings:1,
    father_occ:'Doctor (Nephrologist)', mother_occ:'Lawyer',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Photography','Hiking','Reading Short Stories','Pottery','Travelling'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'yes_absolutely',
    specialty:['Nephrology'], med_status:'pursuing_pg', total_exp:24,
    work:[
      {org_name:'Government Medical College, Kozhikode', designation:'Junior Nephrology Resident', start_month:'08', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Baby Memorial Hospital, Kozhikode', designation:'House Surgeon', start_month:'02', start_year:'2022', end_month:'07', end_year:'2023', is_current:false},
    ],
    fam:68, career:74, indep:65, emo:72, soc:58, trad:35, reloc:75, pace:65,
    fam_n:'Values family; building her own identity alongside strong family roots.',
    career_n:'Following father\'s footsteps into nephrology with genuine passion.',
    indep_n:'Values personal space and autonomy in a healthy relationship.',
    emo_n:'Expressive and creative; processes through writing and art.',
    soc_n:'Selective; prioritises meaningful over frequent connections.',
    trad_n:'Very progressive; completely open to different backgrounds.',
    reloc_n:'Highly open to relocation; excited by possibility.',
    pace_n:'Balanced; creative hobbies give her essential downtime.',
    comm:'expressive', conflict:'collaborative', role:'flexible', fin:'financially_intentional',
    summary:"A creative, progressive Kerala nephrology resident with an open heart and genuine curiosity. Follows her father's footsteps with her own vision for the future.",
    quote:"I want a partner who is a friend, an adventure, and a home all at once.",
    closing:"I approach this with openness and genuine intention.",
    pa_min:24, pa_max:31, ph_min:165, ph_max:182, pref_states:['Kerala','Tamil Nadu','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Creative','Adventurous','Open-minded','Kind','Emotionally mature'],
  },

  // =====================================================================
  // GROUP E: MULTI-MATCH FEMALES (indices 53–57, broad preferences)
  // =====================================================================

  { // 53
    email:'trisha.ghosh@demo.samvaya.test', first:'Trisha', last:'Ghosh', gender:'female', dob:'1996-10-05',
    state:'West Bengal', city:'Kolkata', religion:'Hindu', tongue:'Bengali', languages:['Bengali','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:161, weight:53, siblings:1,
    father_occ:'Doctor', mother_occ:'Professor',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Rabindra Sangeet','Travel','Cooking','Reading','Theatre'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'yes_absolutely',
    specialty:['Cardiology'], med_status:'completed_pg', total_exp:60,
    work:[
      {org_name:'SSKM Hospital, Kolkata', designation:'Consultant Cardiologist', start_month:'08', start_year:'2021', end_month:'', end_year:'', is_current:true},
      {org_name:'NRS Medical College, Kolkata', designation:'Senior Resident', start_month:'01', start_year:'2019', end_month:'07', end_year:'2021', is_current:false},
    ],
    fam:65, career:70, indep:58, emo:63, soc:65, trad:48, reloc:72, pace:62,
    comm:'expressive', conflict:'collaborative', role:'flexible', fin:'financially_intentional',
    summary:'A warm, culturally rich Bengali cardiologist with no rigid preferences. Open to any location, background, or lifestyle. Just wants the right person.',
    quote:'Background is a starting point, not a destination.',
    closing:'I am ready to find love wherever it is.',
    pa_min:27, pa_max:35, ph_min:165, ph_max:188, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['non_vegetarian','vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Kind','Open-minded','Good communicator','Supportive','Emotionally mature'],
  },

  { // 54
    email:'pallavi.sen@demo.samvaya.test', first:'Pallavi', last:'Sen', gender:'female', dob:'1994-07-23',
    state:'West Bengal', city:'Kolkata', religion:'Hindu', tongue:'Bengali', languages:['Bengali','English','Hindi'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'B+', height:163, weight:55, siblings:0,
    father_occ:'Film Director', mother_occ:'Doctor',
    diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Bengali Literature','Films','Photography','Travel','Cooking'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'yes_absolutely',
    specialty:['Dermatology'], med_status:'completed_pg', total_exp:72,
    work:[
      {org_name:'Apollo Gleneagles, Kolkata', designation:'Consultant Dermatologist', start_month:'05', start_year:'2020', end_month:'', end_year:'', is_current:true},
      {org_name:'IPGME&R, Kolkata', designation:'Senior Resident', start_month:'07', start_year:'2018', end_month:'04', end_year:'2020', is_current:false},
    ],
    fam:68, career:68, indep:55, emo:65, soc:62, trad:50, reloc:68, pace:60,
    comm:'direct', conflict:'reflects_first', role:'flexible', fin:'financially_intentional',
    summary:'An artistic, independent-minded Bengali dermatologist with wide cultural interests and completely open preferences. Connection matters far more than background.',
    quote:'I have no list. Just a feeling I am looking for.',
    closing:'I am open to wherever this leads.',
    pa_min:28, pa_max:38, ph_min:165, ph_max:190, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian','vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Open-minded','Intellectually curious','Kind','Independent','Creative'],
  },

  { // 55
    email:'nisha.pandey@demo.samvaya.test', first:'Nisha', last:'Pandey', gender:'female', dob:'1999-05-10',
    state:'Madhya Pradesh', city:'Bhopal', religion:'Hindu', tongue:'Hindi', languages:['Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:160, weight:52, siblings:2,
    father_occ:'Government Doctor', mother_occ:'School Teacher',
    diet:'eggetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading','Volunteering','Cooking','Nature Walks','Music'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'yes_absolutely',
    specialty:['Pediatrics'], med_status:'pursuing_pg', total_exp:20,
    work:[
      {org_name:'AIIMS Bhopal', designation:'Junior Paediatrics Resident', start_month:'07', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Hamidia Hospital, Bhopal', designation:'House Surgeon', start_month:'01', start_year:'2022', end_month:'06', end_year:'2023', is_current:false},
    ],
    fam:70, career:65, indep:55, emo:68, soc:60, trad:45, reloc:75, pace:62,
    comm:'expressive', conflict:'collaborative', role:'co_builder', fin:'financially_casual',
    summary:'A warm, genuine young doctor from Bhopal with completely open preferences and a big heart. Ready to find the right person anywhere in India.',
    quote:'I want a partner who is good — everything else is secondary.',
    closing:'I approach this with simplicity and sincerity.',
    pa_min:24, pa_max:32, ph_min:165, ph_max:185, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['eggetarian','vegetarian','non_vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Kind','Caring','Honest','Humble','Supportive'],
  },

  { // 56
    email:'chitra.subramaniam@demo.samvaya.test', first:'Chitra', last:'Subramaniam', gender:'female', dob:'1992-09-17',
    state:'Tamil Nadu', city:'Chennai', religion:'Hindu', tongue:'Tamil', languages:['Tamil','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'AB+', height:162, weight:56, siblings:1,
    father_occ:'Doctor (Endocrinologist)', mother_occ:'Doctor (GP)',
    diet:'vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Cooking','Yoga','Reading','Travel','Music'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'yes_absolutely',
    specialty:['Endocrinology'], med_status:'completed_pg', total_exp:84,
    work:[
      {org_name:'Apollo Hospitals, Chennai', designation:'Consultant Endocrinologist', start_month:'04', start_year:'2019', end_month:'', end_year:'', is_current:true},
      {org_name:'Madras Medical College', designation:'Senior Resident', start_month:'07', start_year:'2017', end_month:'03', end_year:'2019', is_current:false},
    ],
    fam:70, career:72, indep:52, emo:62, soc:60, trad:50, reloc:65, pace:58,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    summary:'An accomplished second-generation Chennai endocrinologist with no rigid partner preferences. Values genuine character above all else.',
    quote:'Credentials are what brought you here. Character is what matters.',
    closing:'I am open to finding the right person wherever they are.',
    pa_min:28, pa_max:40, ph_min:165, ph_max:190, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Grounded','Caring','Open-minded','Emotionally mature','Financially responsible'],
  },

  { // 57
    email:'ananya.batra@demo.samvaya.test', first:'Ananya', last:'Batra', gender:'female', dob:'1997-02-28',
    state:'Delhi', city:'New Delhi', religion:'Hindu', tongue:'Hindi', languages:['Hindi','Punjabi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:162, weight:55, siblings:1,
    father_occ:'Senior Diplomat', mother_occ:'Architect',
    diet:'vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Running','Cooking World Cuisines','Travel','Reading','Photography'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'yes_absolutely',
    specialty:['Rheumatology'], med_status:'pursuing_pg', total_exp:22,
    work:[
      {org_name:'AIIMS Delhi', designation:'Junior Rheumatology Resident', start_month:'08', start_year:'2023', end_month:'', end_year:'', is_current:true},
      {org_name:'Safdarjung Hospital, Delhi', designation:'House Surgeon', start_month:'02', start_year:'2022', end_month:'07', end_year:'2023', is_current:false},
    ],
    fam:65, career:72, indep:60, emo:65, soc:62, trad:40, reloc:72, pace:65,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    summary:'A globally-minded Delhi rheumatology resident with a diplomat\'s broad outlook and zero rigid preferences. Completely open to any background, region, or lifestyle.',
    quote:'The world is big enough to find the right person anywhere.',
    closing:'I approach this with full openness and genuine readiness.',
    pa_min:25, pa_max:34, ph_min:165, ph_max:188, pref_states:[], no_loc:true,
    smoke_pref:'no_preference', drink_pref:'no_preference', diet_pref:['vegetarian','eggetarian','non_vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue',
    qualities:['Open-minded','Ambitious','Kind','Independent','Good communicator'],
  },

  // =====================================================================
  // GROUP F: FILLER FEMALES (indices 58–74)
  // =====================================================================

  { email:'deepa.thomas@demo.samvaya.test', first:'Deepa', last:'Thomas', gender:'female', dob:'1995-11-03',
    state:'Kerala', city:'Kochi', religion:'Christian', tongue:'Malayalam', languages:['Malayalam','English'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:false, blood:'O+', height:161, weight:54, siblings:1,
    father_occ:'Pastor', mother_occ:'Nurse', diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Church Music','Reading','Travel','Cooking','Badminton'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Medical Oncology'], med_status:'completed_pg', total_exp:66,
    work:null, fam:68, career:70, indep:55, emo:62, soc:62, trad:48, reloc:65, pace:60,
    comm:'expressive', conflict:'collaborative', role:'flexible', fin:'financially_intentional',
    pa_min:27, pa_max:34, ph_min:168, ph_max:185, pref_states:['Kerala','Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Kind','Caring','Family-oriented','Honest','Supportive'],
  },

  { email:'fatima.siddiqui@demo.samvaya.test', first:'Fatima', last:'Siddiqui', gender:'female', dob:'1996-06-19',
    state:'Uttar Pradesh', city:'Allahabad', religion:'Muslim', tongue:'Urdu', languages:['Urdu','Hindi','English'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:false, blood:'A+', height:160, weight:52, siblings:2,
    father_occ:'Advocate', mother_occ:'Homemaker', diet:'non_vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Urdu Poetry','Reading','Cooking','Teaching','Community Work'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Pediatrics'], med_status:'pursuing_pg', total_exp:26,
    work:null, fam:72, career:65, indep:50, emo:65, soc:58, trad:62, reloc:62, pace:58,
    comm:'indirect', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:25, pa_max:32, ph_min:168, ph_max:185, pref_states:['Uttar Pradesh','Delhi','Bihar'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['non_vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Caring','Humble','Family-oriented','Honest','Kind'],
  },

  { email:'nishita.shah@demo.samvaya.test', first:'Nishita', last:'Shah', gender:'female', dob:'1992-10-07',
    state:'Gujarat', city:'Surat', religion:'Jain', tongue:'Gujarati', languages:['Gujarati','Hindi','English'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:true, blood:'B+', height:159, weight:51, siblings:1,
    father_occ:'Diamond Trader', mother_occ:'Homemaker', diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Cooking','Garba','Jain Pilgrimage','Embroidery','Family Events'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Dermatology'], med_status:'completed_pg', total_exp:78,
    work:null, fam:86, career:62, indep:36, emo:55, soc:62, trad:82, reloc:32, pace:48,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    pa_min:28, pa_max:36, ph_min:168, ph_max:182, pref_states:['Gujarat'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way', qualities:['Traditional','Religious','Family-oriented','Humble','Grounded'],
  },

  { email:'surbhi.banerjee@demo.samvaya.test', first:'Surbhi', last:'Banerjee', gender:'female', dob:'1999-08-22',
    state:'West Bengal', city:'Kolkata', religion:'Hindu', tongue:'Bengali', languages:['Bengali','English','Hindi'],
    religious_obs:'spiritual', kundali:false, caste_comfort:false, blood:'O+', height:159, weight:51, siblings:1,
    father_occ:'Journalist', mother_occ:'Lecturer', diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Writing','Films','Travel','Reading','Adda (conversations)'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'open', children_count:'no_preference', children_timing:'no_preference', reloc_comfort:'open_to_it',
    specialty:['Psychiatry'], med_status:'pursuing_pg', total_exp:20,
    work:null, fam:60, career:65, indep:65, emo:70, soc:60, trad:35, reloc:68, pace:62,
    comm:'expressive', conflict:'reflects_first', role:'co_builder', fin:'financially_casual',
    pa_min:24, pa_max:31, ph_min:165, ph_max:182, pref_states:['West Bengal','Odisha'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Creative','Open-minded','Intellectually curious','Kind','Independent'],
  },

  { email:'madhuri.rao@demo.samvaya.test', first:'Madhuri', last:'Rao', gender:'female', dob:'1990-12-14',
    state:'Andhra Pradesh', city:'Vijayawada', religion:'Hindu', tongue:'Telugu', languages:['Telugu','English','Hindi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:163, weight:57, siblings:2,
    father_occ:'Doctor (Cardiologist)', mother_occ:'Doctor (Paediatrician)', diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Cooking','Travel','Reading','Tennis','Classical Dance'],
    timeline:'within_6_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'open_to_it',
    specialty:['Cardiothoracic Surgery'], med_status:'completed_pg', total_exp:96,
    work:null, fam:70, career:72, indep:50, emo:60, soc:65, trad:52, reloc:62, pace:58,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    pa_min:30, pa_max:38, ph_min:168, ph_max:188, pref_states:['Andhra Pradesh','Telangana','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Ambitious','Honest','Family-oriented','Kind','Grounded'],
  },

  { email:'alisha.naik@demo.samvaya.test', first:'Alisha', last:'Naik', gender:'female', dob:'1996-04-08',
    state:'Goa', city:'Panaji', religion:'Hindu', tongue:'Konkani', languages:['Konkani','English','Hindi','Marathi'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:160, weight:52, siblings:1,
    father_occ:'Hotel Manager', mother_occ:'Teacher', diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Watersports','Cooking Goan Food','Travel','Music','Running'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Emergency Medicine'], med_status:'completed_pg', total_exp:60,
    work:null, fam:62, career:68, indep:60, emo:65, soc:72, trad:40, reloc:68, pace:65,
    comm:'expressive', conflict:'addresses_immediately', role:'flexible', fin:'financially_casual',
    pa_min:26, pa_max:33, ph_min:168, ph_max:185, pref_states:['Goa','Maharashtra','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Energetic','Fun','Kind','Honest','Open-minded'],
  },

  { email:'kavya.hegde@demo.samvaya.test', first:'Kavya', last:'Hegde', gender:'female', dob:'1998-07-15',
    state:'Karnataka', city:'Mangalore', religion:'Hindu', tongue:'Tulu', languages:['Tulu','Kannada','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:159, weight:50, siblings:2,
    father_occ:'Business Owner', mother_occ:'Nurse', diet:'non_vegetarian', smoking:'never', drinking:'never', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Yoga','Cooking Coastal Karnataka Food','Reading','Fitness','Temple Visits'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['ENT (Otorhinolaryngology)'], med_status:'pursuing_pg', total_exp:22,
    work:null, fam:70, career:65, indep:55, emo:62, soc:62, trad:48, reloc:68, pace:60,
    comm:'indirect', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:24, pa_max:31, ph_min:165, ph_max:182, pref_states:['Karnataka','Kerala','Goa'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Kind','Honest','Family-oriented','Health-conscious','Caring'],
  },

  { email:'preeti.nanda@demo.samvaya.test', first:'Preeti', last:'Nanda', gender:'female', dob:'1994-11-30',
    state:'Delhi', city:'New Delhi', religion:'Hindu', tongue:'Punjabi', languages:['Punjabi','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:162, weight:56, siblings:1,
    father_occ:'Senior Doctor (Surgeon)', mother_occ:'Doctor (Physician)', diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'regularly_exercises', tattoos:'none',
    hobbies:['Gym','Travel','Delhi Food Scene','Reading','Tennis'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Radiology'], med_status:'completed_pg', total_exp:72,
    work:null, fam:65, career:70, indep:58, emo:60, soc:65, trad:42, reloc:65, pace:62,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    pa_min:27, pa_max:34, ph_min:168, ph_max:187, pref_states:['Delhi','Haryana','Punjab'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Ambitious','Good communicator','Kind','Honest','Energetic'],
  },

  { email:'tanuja.deshpande@demo.samvaya.test', first:'Tanuja', last:'Deshpande', gender:'female', dob:'1997-08-24',
    state:'Maharashtra', city:'Nagpur', religion:'Hindu', tongue:'Marathi', languages:['Marathi','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:160, weight:52, siblings:1,
    father_occ:'Engineer', mother_occ:'Teacher', diet:'vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Classical Music','Reading','Cooking','Gardening','Travel'],
    timeline:'1_to_2_years', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Gastroenterology'], med_status:'pursuing_pg', total_exp:24,
    work:null, fam:68, career:65, indep:55, emo:62, soc:58, trad:50, reloc:60, pace:58,
    comm:'direct', conflict:'reflects_first', role:'co_builder', fin:'financially_casual',
    pa_min:25, pa_max:32, ph_min:168, ph_max:182, pref_states:['Maharashtra','Madhya Pradesh'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Kind','Honest','Caring','Family-oriented','Grounded'],
  },

  { email:'ruchika.trivedi@demo.samvaya.test', first:'Ruchika', last:'Trivedi', gender:'female', dob:'1991-05-18',
    state:'Gujarat', city:'Vadodara', religion:'Hindu', tongue:'Gujarati', languages:['Gujarati','Hindi','English'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'B+', height:160, weight:54, siblings:2,
    father_occ:'Businessman', mother_occ:'Homemaker', diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Garba','Cooking','Community Events','Yoga','Family Visits'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Nephrology'], med_status:'completed_pg', total_exp:90,
    work:null, fam:85, career:62, indep:36, emo:55, soc:62, trad:80, reloc:32, pace:48,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    pa_min:30, pa_max:37, ph_min:168, ph_max:182, pref_states:['Gujarat'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way', qualities:['Traditional','Family-oriented','Grounded','Caring','Humble'],
  },

  { email:'varsha.fernandes@demo.samvaya.test', first:'Varsha', last:'Fernandes', gender:'female', dob:'1996-02-12',
    state:'Goa', city:'Panaji', religion:'Christian', tongue:'Konkani', languages:['Konkani','English','Marathi'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:false, blood:'O+', height:161, weight:53, siblings:2,
    father_occ:'Teacher', mother_occ:'Nurse', diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Church Music','Cooking','Beach','Travel','Books'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['General Medicine'], med_status:'completed_pg', total_exp:60,
    work:null, fam:65, career:65, indep:60, emo:65, soc:68, trad:42, reloc:65, pace:62,
    comm:'expressive', conflict:'collaborative', role:'flexible', fin:'financially_casual',
    pa_min:26, pa_max:33, ph_min:168, ph_max:185, pref_states:['Goa','Maharashtra'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Kind','Fun','Honest','Caring','Open-minded'],
  },

  { email:'sudha.iyengar@demo.samvaya.test', first:'Sudha', last:'Iyengar', gender:'female', dob:'1989-09-25',
    state:'Tamil Nadu', city:'Chennai', religion:'Hindu', tongue:'Tamil', languages:['Tamil','English','Sanskrit'],
    religious_obs:'actively_practicing', kundali:true, caste_comfort:true, blood:'A+', height:160, weight:55, siblings:1,
    father_occ:'Retired Professor', mother_occ:'Classical Dancer', diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Bharatanatyam','Carnatic Music','Cooking','Temple Service','Reading Scriptures'],
    timeline:'within_6_months', family_arr:'joint', working_exp:'comfortable_either_way',
    wants_children:'yes', children_count:'2', children_timing:'within_1_2_years', reloc_comfort:'prefer_same_location',
    specialty:['Cardiothoracic Surgery'], med_status:'completed_pg', total_exp:108,
    work:null, fam:86, career:68, indep:35, emo:55, soc:52, trad:85, reloc:30, pace:45,
    comm:'indirect', conflict:'reflects_first', role:'anchor_complement', fin:'financially_intentional',
    pa_min:32, pa_max:40, ph_min:168, ph_max:185, pref_states:['Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'joint', career_exp_pref:'comfortable_either_way', qualities:['Traditional','Religious','Family-oriented','Humble','Grounded'],
  },

  { email:'annu.singh@demo.samvaya.test', first:'Annu', last:'Singh', gender:'female', dob:'1998-06-01',
    state:'Bihar', city:'Patna', religion:'Hindu', tongue:'Maithili', languages:['Maithili','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:158, weight:50, siblings:3,
    father_occ:'Farmer', mother_occ:'School Teacher', diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Singing','Cooking','Volunteering','Yoga','Reading'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Community Medicine'], med_status:'pursuing_pg', total_exp:20,
    work:null, fam:75, career:60, indep:45, emo:62, soc:55, trad:62, reloc:60, pace:52,
    comm:'indirect', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:24, pa_max:30, ph_min:165, ph_max:180, pref_states:['Bihar','Jharkhand','Uttar Pradesh'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Humble','Caring','Hard-working','Honest','Kind'],
  },

  { email:'monica.dsouza@demo.samvaya.test', first:'Monica', last:"D'Souza", gender:'female', dob:'1993-03-29',
    state:'Karnataka', city:'Mangalore', religion:'Christian', tongue:'Konkani', languages:['Konkani','English','Kannada'],
    religious_obs:'actively_practicing', kundali:false, caste_comfort:false, blood:'O+', height:162, weight:55, siblings:2,
    father_occ:'Doctor', mother_occ:'Nurse', diet:'non_vegetarian', smoking:'never', drinking:'occasionally', fitness:'occasionally', tattoos:'none',
    hobbies:['Church Music','Reading','Cooking Goan-Mangalorean Food','Travel','Badminton'],
    timeline:'6_to_12_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Medical Oncology'], med_status:'completed_pg', total_exp:72,
    work:null, fam:68, career:70, indep:55, emo:65, soc:65, trad:48, reloc:65, pace:60,
    comm:'expressive', conflict:'collaborative', role:'flexible', fin:'financially_intentional',
    pa_min:27, pa_max:35, ph_min:168, ph_max:185, pref_states:['Karnataka','Kerala','Goa'], no_loc:false,
    smoke_pref:'never', drink_pref:'no_preference', diet_pref:['non_vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Kind','Caring','Honest','Family-oriented','Open-minded'],
  },

  { email:'rekha.pillai@demo.samvaya.test', first:'Rekha', last:'Pillai', gender:'female', dob:'1995-08-07',
    state:'Kerala', city:'Thrissur', religion:'Hindu', tongue:'Malayalam', languages:['Malayalam','English','Tamil'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'B+', height:160, weight:52, siblings:1,
    father_occ:'Government Officer', mother_occ:'Teacher', diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Kathakali (watching)','Reading','Cooking','Temple Visits','Classical Music'],
    timeline:'6_to_12_months', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Cardiology'], med_status:'completed_pg', total_exp:60,
    work:null, fam:72, career:68, indep:52, emo:62, soc:52, trad:48, reloc:62, pace:58,
    comm:'indirect', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:27, pa_max:33, ph_min:168, ph_max:182, pref_states:['Kerala','Tamil Nadu'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Grounded','Caring','Kind','Humble','Family-oriented'],
  },

  { email:'kamna.khanna@demo.samvaya.test', first:'Kamna', last:'Khanna', gender:'female', dob:'1992-01-16',
    state:'Delhi', city:'New Delhi', religion:'Hindu', tongue:'Hindi', languages:['Hindi','Punjabi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'A+', height:163, weight:57, siblings:1,
    father_occ:'Senior Advocate', mother_occ:'Doctor (Psychiatrist)', diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Reading Psychology','Mindfulness','Travel','Cooking','Theatre'],
    timeline:'within_6_months', family_arr:'nuclear', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Psychiatry'], med_status:'completed_pg', total_exp:84,
    work:null, fam:68, career:72, indep:58, emo:70, soc:58, trad:40, reloc:65, pace:62,
    comm:'direct', conflict:'addresses_immediately', role:'co_builder', fin:'financially_intentional',
    pa_min:28, pa_max:36, ph_min:168, ph_max:185, pref_states:['Delhi','Haryana','Punjab'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian','eggetarian'],
    fam_type_pref:'nuclear', career_exp_pref:'both_continue', qualities:['Emotionally mature','Intellectually curious','Kind','Honest','Supportive'],
  },

  { email:'supriya.wagh@demo.samvaya.test', first:'Supriya', last:'Wagh', gender:'female', dob:'1997-10-22',
    state:'Maharashtra', city:'Nashik', religion:'Hindu', tongue:'Marathi', languages:['Marathi','Hindi','English'],
    religious_obs:'culturally_observant', kundali:false, caste_comfort:false, blood:'O+', height:161, weight:53, siblings:2,
    father_occ:'Farmer', mother_occ:'Teacher', diet:'vegetarian', smoking:'never', drinking:'never', fitness:'occasionally', tattoos:'none',
    hobbies:['Cooking','Yoga','Gardening','Reading','Trekking'],
    timeline:'1_to_2_years', family_arr:'flexible', working_exp:'both_continue',
    wants_children:'yes', children_count:'2', children_timing:'after_3_5_years', reloc_comfort:'open_to_it',
    specialty:['Ophthalmology'], med_status:'pursuing_pg', total_exp:24,
    work:null, fam:70, career:65, indep:52, emo:62, soc:55, trad:52, reloc:62, pace:58,
    comm:'indirect', conflict:'reflects_first', role:'co_builder', fin:'financially_intentional',
    pa_min:25, pa_max:32, ph_min:168, ph_max:182, pref_states:['Maharashtra','Madhya Pradesh','Karnataka'], no_loc:false,
    smoke_pref:'never', drink_pref:'never', diet_pref:['vegetarian'],
    fam_type_pref:'flexible', career_exp_pref:'both_continue', qualities:['Kind','Humble','Honest','Family-oriented','Grounded'],
  },
];

// ============================================================
// PAIR CONFIGURATION (0-indexed profile indices)
// ============================================================

const PAIRS = [
  { m: 0,  f: 38, score: 88, rec: 'strongly_recommend' },
  { m: 1,  f: 39, score: 85, rec: 'strongly_recommend' },
  { m: 2,  f: 40, score: 82, rec: 'strongly_recommend' },
  { m: 3,  f: 41, score: 86, rec: 'strongly_recommend' },
  { m: 4,  f: 42, score: 89, rec: 'strongly_recommend' },
  { m: 5,  f: 43, score: 83, rec: 'strongly_recommend' },
  { m: 6,  f: 44, score: 87, rec: 'strongly_recommend' },
  { m: 7,  f: 45, score: 79, rec: 'recommend' },
  { m: 8,  f: 46, score: 84, rec: 'strongly_recommend' },
  { m: 9,  f: 47, score: 91, rec: 'strongly_recommend' },
  { m: 10, f: 48, score: 82, rec: 'strongly_recommend' },
  { m: 11, f: 49, score: 76, rec: 'recommend' },
  { m: 12, f: 50, score: 80, rec: 'recommend' },
  { m: 13, f: 51, score: 88, rec: 'strongly_recommend' },
  { m: 14, f: 52, score: 77, rec: 'recommend' },
];

// Dimension scores for each pair's compatibility_report
const PAIR_DIMS = [
  { career:85, values:90, lifestyle:88, reloc:82, comm:90, family:88, fin:90, timeline:90, emotional:85 }, // pair 0: 88
  { career:82, values:87, lifestyle:80, reloc:85, comm:88, family:78, fin:88, timeline:85, emotional:82 }, // pair 1: 85
  { career:78, values:80, lifestyle:83, reloc:75, comm:82, family:77, fin:72, timeline:82, emotional:80 }, // pair 2: 82
  { career:88, values:88, lifestyle:87, reloc:72, comm:82, family:86, fin:88, timeline:86, emotional:78 }, // pair 3: 86
  { career:85, values:92, lifestyle:90, reloc:70, comm:85, family:90, fin:92, timeline:92, emotional:82 }, // pair 4: 89
  { career:80, values:85, lifestyle:85, reloc:78, comm:87, family:80, fin:88, timeline:83, emotional:85 }, // pair 5: 83
  { career:85, values:90, lifestyle:88, reloc:72, comm:80, family:86, fin:88, timeline:90, emotional:80 }, // pair 6: 87
  { career:80, values:82, lifestyle:78, reloc:78, comm:72, family:74, fin:72, timeline:80, emotional:68 }, // pair 7: 79
  { career:86, values:88, lifestyle:87, reloc:82, comm:87, family:84, fin:88, timeline:86, emotional:83 }, // pair 8: 84
  { career:88, values:92, lifestyle:90, reloc:82, comm:94, family:90, fin:92, timeline:92, emotional:90 }, // pair 9: 91
  { career:82, values:84, lifestyle:85, reloc:78, comm:88, family:82, fin:88, timeline:85, emotional:80 }, // pair 10: 82
  { career:80, values:82, lifestyle:84, reloc:86, comm:72, family:75, fin:84, timeline:80, emotional:72 }, // pair 11: 76
  { career:78, values:82, lifestyle:80, reloc:75, comm:82, family:78, fin:72, timeline:80, emotional:78 }, // pair 12: 80
  { career:92, values:90, lifestyle:88, reloc:70, comm:85, family:87, fin:88, timeline:92, emotional:83 }, // pair 13: 88
  { career:82, values:82, lifestyle:85, reloc:87, comm:72, family:74, fin:84, timeline:80, emotional:74 }, // pair 14: 77
];

const PAIR_NARRATIVES = [
  'Exceptional alignment across all dimensions. Both are South Indian Cardiology specialists sharing identical cultural values, diet, and life pace. Their mirrored ambition and direct communication style creates a foundation for a deeply equal partnership.',
  'Strong intellectual and professional alignment. Both are high-ambition neurologists/psychiatrists from Karnataka with matching progressive values. The slight independence lean in both profiles is actually a strength — they understand each other\'s need for personal space.',
  'Natural peers at the same career stage with complementary energy. Both Maharashtra residents with similar life pace, social orientation, and expressive communication. A match grounded in genuine day-to-day compatibility.',
  'Culturally aligned Tamil couple with deep shared values. Same surgical specialty creates powerful career alignment. Their anchor-complement dynamic and indirect, reflective communication style are perfectly matched — neither one overpowers the other.',
  'Outstanding alignment. The highest traditional-values pair in the dataset. Both Gujarati, both deeply family-oriented, both prefer joint family structure. Identical communication styles, financial values, and timeline. A match that will feel immediately natural.',
  'Young, emotionally expressive North Indian couple who will understand each other deeply. Their Psychiatry-Paediatrics pairing creates career empathy. Collaborative conflict approach means disagreements become conversations, not conflicts.',
  'Traditional Rajasthani match with deeply aligned values. Both are reserved, reflective communicators who prefer togetherness. Their high traditionalism scores (68/70) and joint family preference create a shared vision for home life that is rare to find.',
  'Good compatibility with one intentional tension: independence vs. togetherness gap (72 vs 40). This reflects a genuine dynamic worth discussing — Nikhil values personal space, Swathi values closeness. Their shared Telugu background, career stage, and financial values provide a strong foundation.',
  'Two calm, measured Tamil professionals with near-identical spider charts. Anesthesiology and Cardiology — both high-stakes specialties with similar intensity rhythms. A steady, quietly deep match.',
  'Exceptional. The showcase pair. Sikh couple from Punjab with the highest alignment scores in the dataset. All 8 spider dimensions within 4 points. Both expressive, collaborative, family-centred, and financially intentional. This match will feel like they already know each other.',
  'Strong Delhi couple with clean values alignment. Both AIIMS-trained, progressive, and direct communicators. Career ambition is well-matched, and their shared nuclear-family orientation creates a clear shared vision for the future.',
  'Two progressive young Kerala residents following their parents\' specialties. Conflict approach differences (reflects_first vs. addresses_immediately) create the only friction point. Their very high relocation openness creates flexible opportunity for the future.',
  'Urban North Indian couple with strong social compatibility and matched life energy. Financially casual on both sides — AI will recommend aligning on savings goals. Good emotional and communication compatibility.',
  'The Pathology × Pathology showcase — strongest career alignment of any pair. Same specialty, same hospital, same city. Pune Maharashtrian couple with deep cultural alignment, high family orientation, and a shared vision for a stable, rooted life together.',
  'Two progressive Kerala Nephrology residents — same specialty creates strong career alignment. Conflict approach mismatch (reflects_first vs. collaborative) and role vision difference (co_builder vs. flexible) are areas to navigate. High relocation openness and strong cultural alignment make this a genuine recommend.',
];

// Presentations for top 5 pairs
const PRESENTATIONS = [
  { pairIdx: 9,  memberAResp: 'interested', memberBResp: 'interested',  status: 'mutual_interest', daysAgo: 5 },
  { pairIdx: 4,  memberAResp: 'pending',    memberBResp: 'pending',     status: 'pending',         daysAgo: 2 },
  { pairIdx: 0,  memberAResp: 'interested', memberBResp: 'pending',     status: 'pending',         daysAgo: 3 },
  { pairIdx: 13, memberAResp: 'interested', memberBResp: 'not_interested', status: 'one_sided',    daysAgo: 7 },
  { pairIdx: 6,  memberAResp: 'pending',    memberBResp: 'pending',     status: 'pending',         daysAgo: 1 },
];

// ============================================================
// SEEDING LOGIC
// ============================================================

async function main() {
  console.log('\n🌱 Samvaya — Seeding 75 demo doctor profiles\n' + '─'.repeat(60));

  // 1. Get existing users
  const { data: existingData } = await db.auth.admin.listUsers({ perPage: 1000 });
  const existingUsers = existingData?.users ?? [];

  // 2. Create auth users
  console.log('\n👤 Creating auth users...');
  const userIds = [];
  for (const p of PROFILES) {
    const existing = existingUsers.find(u => u.email === p.email);
    if (existing) {
      userIds.push(existing.id);
      process.stdout.write('⏭  ');
      continue;
    }
    const { data, error } = await db.auth.admin.createUser({
      email: p.email,
      email_confirm: true,
      user_metadata: { full_name: `${p.first} ${p.last}` },
    });
    if (error) {
      console.error(`\n  ❌ ${p.email}: ${error.message}`);
      userIds.push(null);
    } else {
      userIds.push(data.user.id);
      process.stdout.write('✅ ');
    }
    await sleep(120);
  }
  console.log(`\n  → ${userIds.filter(Boolean).length} users ready`);

  // 3. Update users table
  console.log('\n📊 Setting pipeline statuses...');
  for (let i = 0; i < PROFILES.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;
    await db.from('users').update({
      role: 'applicant',
      payment_status: 'in_pool',
      membership_status: 'onboarding_complete',
      onboarding_section: 13,
      onboarding_last_question: 100,
      ai_conversation_status: 'all_complete',
      profile_completion_pct: 100,
      bgv_consent: 'consented',
      is_bgv_complete: true,
      verified_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    }).eq('id', uid);
  }
  console.log('  ✅ All statuses set to in_pool + BGV complete');

  // 4. Upsert profiles
  console.log('\n🪪 Seeding profiles...');
  for (let i = 0; i < PROFILES.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;
    const p = PROFILES[i];
    const daysBack = Math.floor(Math.random() * 60);
    await db.from('profiles').upsert({
      user_id: uid,
      first_name: p.first,
      last_name: p.last,
      gender: p.gender,
      referral_source: 'goocampus',
      marital_status: 'first_marriage',
      has_children_from_previous: false,
      date_of_birth: p.dob,
      place_of_birth: p.city,
      city_of_birth: p.city,
      blood_group: p.blood,
      mother_tongue: p.tongue,
      languages_spoken: p.languages,
      citizenship_country: 'India',
      current_country: 'India',
      current_state: p.state,
      current_city: p.city,
      permanent_city: p.city,
      permanent_ownership: 'family_home',
      religion: p.religion,
      religious_observance: p.religious_obs,
      believes_in_kundali: p.kundali ?? false,
      caste_comfort: p.caste_comfort ?? false,
      father_name: `Mr. ${p.last}`,
      father_occupation: p.father_occ,
      mother_name: `Mrs. ${p.last}`,
      mother_occupation: p.mother_occ,
      siblings_count: p.siblings ?? 1,
      height_cm: p.height,
      weight_kg: p.weight,
      diet: p.diet,
      attire_preference: 'mix',
      fitness_habits: p.fitness,
      smoking: p.smoking,
      drinking: p.drinking,
      tattoos_piercings: p.tattoos || 'none',
      has_disability: 'no',
      has_allergies: false,
      hobbies_interests: p.hobbies,
      hobbies_regular: `Regular interests include ${p.hobbies.slice(0, 3).join(', ')}.`,
      marriage_timeline: p.timeline,
      long_distance_comfort: 'open_to_it',
      post_marriage_family_arrangement: p.family_arr,
      both_partners_working_expectation: p.working_exp,
      wants_children: p.wants_children,
      children_count_preference: p.children_count,
      children_timing_preference: p.children_timing,
      preferred_settlement_countries: ['India'],
      open_to_immediate_relocation: 'open',
      plans_to_go_abroad: false,
    }, { onConflict: 'user_id' });
  }
  console.log('  ✅ 75 profiles seeded');

  // 5. Medical credentials
  console.log('\n🏥 Seeding medical credentials...');
  for (let i = 0; i < PROFILES.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;
    const p = PROFILES[i];
    const workExpData = p.work ?? genWorkExp(p);
    await db.from('medical_credentials').upsert({
      user_id: uid,
      current_status: p.med_status,
      specialty: p.specialty,
      has_work_experience: p.total_exp > 0,
      work_experience: workExpData,
      current_designation: workExpData.find(w => w.is_current)?.designation || `Doctor`,
      total_experience_months: p.total_exp,
    }, { onConflict: 'user_id' });
  }
  console.log('  ✅ Medical credentials seeded');

  // 6. Partner preferences
  console.log('\n💝 Seeding partner preferences...');
  for (let i = 0; i < PROFILES.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;
    const p = PROFILES[i];
    await db.from('partner_preferences').upsert({
      user_id: uid,
      preferred_age_min: p.pa_min,
      preferred_age_max: p.pa_max,
      preferred_height_min_cm: p.ph_min,
      preferred_height_max_cm: p.ph_max,
      prefers_specific_specialty: false,
      preferred_indian_states: p.pref_states,
      preferred_countries: ['India'],
      no_location_preference: p.no_loc,
      preferred_mother_tongue: [],
      diet_preference: p.diet_pref,
      fitness_preference: 'no_preference',
      smoking_preference: p.smoke_pref,
      drinking_preference: p.drink_pref,
      tattoo_preference: 'no_preference',
      family_type_preference: p.fam_type_pref,
      religious_observance_preference: 'no_preference',
      partner_career_expectation_after_marriage: p.career_exp_pref,
      partner_qualities: p.qualities || ['Kind', 'Ambitious', 'Family-oriented', 'Honest', 'Emotionally mature'],
    }, { onConflict: 'user_id' });
  }
  console.log('  ✅ Partner preferences seeded');

  // 7. Compatibility profiles (spider web scores)
  console.log('\n🕸️  Seeding compatibility profiles...');
  const refDate = new Date(Date.now() - 7 * 86400000).toISOString();
  for (let i = 0; i < PROFILES.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;
    const p = PROFILES[i];
    const notes = (p.fam_n) ? {
      fam_n: p.fam_n, career_n: p.career_n, indep_n: p.indep_n, emo_n: p.emo_n,
      soc_n: p.soc_n, trad_n: p.trad_n, reloc_n: p.reloc_n, pace_n: p.pace_n,
    } : genNotes(p);
    await db.from('compatibility_profiles').upsert({
      user_id: uid,
      conversation_completed_at: refDate,
      input_mode: 'text',
      family_orientation_score: p.fam,
      family_orientation_notes: notes.fam_n,
      career_ambition_score: p.career,
      career_ambition_notes: notes.career_n,
      independence_vs_togetherness_score: p.indep,
      independence_vs_togetherness_notes: notes.indep_n,
      emotional_expressiveness_score: p.emo,
      emotional_expressiveness_notes: notes.emo_n,
      social_orientation_score: p.soc,
      social_orientation_notes: notes.soc_n,
      traditionalism_score: p.trad,
      traditionalism_notes: notes.trad_n,
      relocation_openness_score: p.reloc,
      relocation_openness_notes: notes.reloc_n,
      life_pace_score: p.pace,
      life_pace_notes: notes.pace_n,
      communication_style: p.comm,
      conflict_approach: p.conflict,
      partner_role_vision: p.role,
      financial_values: p.fin,
      ai_personality_summary: p.summary || genSummary(p),
      ai_compatibility_keywords: p.qualities ? p.qualities.slice(0, 5) : ['dedicated', 'family-oriented', 'ambitious', 'honest', 'caring'],
      key_quote: p.quote || genQuote(p),
      closing_freeform_note: p.closing || `${p.first} is ready for a meaningful relationship and approaches this with full sincerity.`,
      extraction_model_version: 'claude-sonnet-4-20250514',
    }, { onConflict: 'user_id' });
  }
  console.log('  ✅ Compatibility profiles seeded');

  // 8. Payments
  console.log('\n💰 Seeding payment records...');
  for (let i = 0; i < PROFILES.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;
    const { data: existing } = await db.from('payments').select('id').eq('user_id', uid).maybeSingle();
    if (existing) continue;
    await db.from('payments').insert({
      user_id: uid,
      payment_type: 'verification_fee',
      amount: 708000,
      currency: 'INR',
      verification_fee_paid: true,
      status: 'captured',
      paid_at: new Date(Date.now() - Math.random() * 45 * 86400000).toISOString(),
    });
  }
  console.log('  ✅ Payments seeded');

  // 9. Match suggestions for 15 deliberate pairs
  console.log('\n💕 Seeding match suggestions (15 deliberate pairs)...');
  const suggestionIds = [];
  for (let pi = 0; pi < PAIRS.length; pi++) {
    const pair = PAIRS[pi];
    const aId = userIds[pair.m];
    const bId = userIds[pair.f];
    if (!aId || !bId) { suggestionIds.push(null); continue; }

    const [profileA, profileB] = aId < bId ? [aId, bId] : [bId, aId];
    const { data: existing } = await db.from('match_suggestions').select('id')
      .eq('profile_a_id', profileA).eq('profile_b_id', profileB).maybeSingle();
    if (existing) { suggestionIds.push(existing.id); continue; }

    const dims = PAIR_DIMS[pi];
    const { data, error } = await db.from('match_suggestions').insert({
      profile_a_id: profileA,
      profile_b_id: profileB,
      overall_compatibility_score: pair.score,
      match_narrative: PAIR_NARRATIVES[pi],
      recommendation: pair.rec,
      admin_status: 'approved',
      compatibility_report: {
        overall_score: pair.score,
        dimension_scores: {
          career_alignment: { score: dims.career, weight: 0.15, notes: 'Career trajectories and ambition well-aligned' },
          values_alignment: { score: dims.values, weight: 0.15, notes: 'Shared cultural values, religion, and lifestyle philosophy' },
          lifestyle_compatibility: { score: dims.lifestyle, weight: 0.12, notes: 'Compatible diet, fitness, and daily habits' },
          relocation_compatibility: { score: dims.reloc, weight: 0.10, notes: 'Geographic preferences and mobility well-matched' },
          communication_compatibility: { score: dims.comm, weight: 0.12, notes: 'Communication style and conflict approach compatible' },
          family_orientation: { score: dims.family, weight: 0.12, notes: 'Family structure preferences aligned' },
          financial_alignment: { score: dims.fin, weight: 0.12, notes: 'Financial values and expectations compatible' },
          timeline_alignment: { score: dims.timeline, weight: 0.06, notes: 'Marriage timeline and children plans aligned' },
          emotional_compatibility: { score: dims.emotional, weight: 0.06, notes: 'Emotional expression and independence balance compatible' },
        },
        highlights: pair.score >= 85
          ? ['Exceptional cultural alignment', 'Matched career ambition', 'Compatible family values']
          : ['Good overall compatibility', 'Compatible lifestyle habits', 'Aligned marriage timeline'],
        concerns: pair.score < 80
          ? ['One dimension gap worth discussing in introductions']
          : [],
        narrative: PAIR_NARRATIVES[pi],
        recommendation: pair.rec,
      },
      ai_model_version: 'claude-sonnet-4-20250514',
    }).select('id').single();

    if (error) {
      console.error(`  ❌ Pair ${pi}: ${error.message}`);
      suggestionIds.push(null);
    } else {
      const mName = PROFILES[pair.m].first;
      const fName = PROFILES[pair.f].first;
      console.log(`  ✅ ${mName} ↔ ${fName} (score: ${pair.score})`);
      suggestionIds.push(data.id);
    }
  }

  // 10. Match presentations for top 5 pairs
  console.log('\n📨 Seeding match presentations (top 5 pairs)...');
  for (const pres of PRESENTATIONS) {
    const suggId = suggestionIds[pres.pairIdx];
    if (!suggId) continue;
    const { data: existing } = await db.from('match_presentations').select('id').eq('match_suggestion_id', suggId).maybeSingle();
    if (existing) continue;
    const presentedAt = new Date(Date.now() - pres.daysAgo * 86400000).toISOString();
    const expiresAt = new Date(Date.now() + (7 - pres.daysAgo) * 86400000).toISOString();
    const { error } = await db.from('match_presentations').insert({
      match_suggestion_id: suggId,
      status: pres.status,
      member_a_response: pres.memberAResp,
      member_b_response: pres.memberBResp,
      member_a_responded_at: pres.memberAResp !== 'pending' ? new Date(Date.now() - (pres.daysAgo - 1) * 86400000).toISOString() : null,
      member_b_responded_at: pres.memberBResp !== 'pending' ? new Date(Date.now() - (pres.daysAgo - 1) * 86400000).toISOString() : null,
      is_mutual_interest: pres.status === 'mutual_interest',
      presented_at: presentedAt,
      expires_at: expiresAt,
    });
    if (!error) {
      const pair = PAIRS[pres.pairIdx];
      console.log(`  ✅ ${PROFILES[pair.m].first} ↔ ${PROFILES[pair.f].first}: ${pres.status}`);
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('✅ Seed complete!\n');
  console.log('📊 Pool summary:');
  console.log(`   Total profiles: ${userIds.filter(Boolean).length}`);
  console.log(`   Male:   ${PROFILES.filter(p => p.gender === 'male').length} (pair: 15, multi-match: 5, filler: 18)`);
  console.log(`   Female: ${PROFILES.filter(p => p.gender === 'female').length} (pair: 15, multi-match: 5, filler: 17)`);
  console.log(`   Match suggestions (pre-seeded): 15`);
  console.log(`   Match presentations: 5`);
  console.log('\n🔗 Next steps:');
  console.log('   1. Visit http://localhost:3000/admin → Match Suggestions to see all 15 pairs');
  console.log('   2. Run the matching algorithm (/api/matching/run) for AI-scored suggestions');
  console.log('      → Multi-match profiles (Sameer, Rohan, Ankur, Devraj, Kartik, Trisha,');
  console.log('        Pallavi, Nisha, Chitra, Ananya) should each generate 3–5 new suggestions');
  console.log('   3. The showcase pair (Pradeep Singh ↔ Harpreet Kaur, score 91) has mutual interest');
}

main().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
