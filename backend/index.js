import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "info.json");
const learningFile = path.join(dataDir, "learning.json");
const usersFile = path.join(dataDir, "users.json");
const scoresFile = path.join(dataDir, "scores.json");
const adminUser = process.env.ADMIN_USER || "admin";
const adminPass = process.env.ADMIN_PASS || "warungaba";
const jwtSecret = process.env.JWT_SECRET || "dev-secret";
const questionTargetPerGrade = 1000;
const passwordIterations = 120000;

function ensureData() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    const initial = {
      name: "Warung Aba",
      description: "Warung lokal berdasarkan informasi Google Maps.",
      coordinates: { lat: -2.9801306, lng: 104.7715024 },
      mapsLink: "https://www.google.com/maps/place/Warung+Aba/@-2.9801306,104.7715024,17z/data=!3m1!4b1!4m6!3m5!1s0x2e3b76143c7506ed:0x255882d1647bb52b!8m2!3d-2.9801306!4d104.7715024!16s%2Fg%2F1hm4wtn74?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D",
      address: "Jl. Contoh No. 1, Palembang",
      hours: {
        monday: "08:00–22:00",
        tuesday: "08:00–22:00",
        wednesday: "08:00–22:00",
        thursday: "08:00–22:00",
        friday: "08:00–23:00",
        saturday: "08:00–23:00",
        sunday: "08:00–22:00"
      },
      contact: {
        phone: "0812-0000-0000",
        whatsapp: "0812-0000-0000",
        instagram: "@warungaba"
      },
      socials: {
        instagram: "https://instagram.com/warungaba"
      },
      products: [
        { id: "p1", name: "Nasi Goreng", price: 20000, category: "Makanan" },
        { id: "p2", name: "Mie Goreng", price: 18000, category: "Makanan" },
        { id: "p3", name: "Teh Manis", price: 5000, category: "Minuman" },
        { id: "p4", name: "Kopi Hitam", price: 7000, category: "Minuman" }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop"
      ],
      highlights: [
        "Bahan segar setiap hari",
        "Harga bersahabat",
        "Porsi mengenyangkan",
        "Lokasi mudah dijangkau"
      ],
      testimonials: [
        { name: "Rina", text: "Nasi gorengnya enak, porsi besar!", rating: 5 },
        { name: "Fajar", text: "Tempatnya nyaman buat nongkrong.", rating: 4 }
      ],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), "utf-8");
  }
  if (!fs.existsSync(learningFile)) {
    const seed = {
      lastUpdated: new Date().toISOString(),
      entries: []
    };
    fs.writeFileSync(learningFile, JSON.stringify(seed, null, 2), "utf-8");
  }
  if (!fs.existsSync(usersFile)) {
    const seed = {
      lastUpdated: new Date().toISOString(),
      users: []
    };
    fs.writeFileSync(usersFile, JSON.stringify(seed, null, 2), "utf-8");
  }
  if (!fs.existsSync(scoresFile)) {
    const seed = {
      lastUpdated: new Date().toISOString(),
      scores: []
    };
    fs.writeFileSync(scoresFile, JSON.stringify(seed, null, 2), "utf-8");
  }
}

function readInfo() {
  ensureData();
  const raw = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(raw);
}

function writeInfo(info) {
  fs.writeFileSync(dataFile, JSON.stringify(info, null, 2), "utf-8");
}

function createMathEntry(id, grade, topic, level, question, answer, hint, explanation) {
  return { id, grade, topic, level, question, answer: String(answer), hint, explanation };
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function formatDecimal(value) {
  return value.toFixed(1).replace(".", ",");
}

function generateClass1Entry(index) {
  const cycle = Math.floor(index / 5);
  const variant = index % 5;
  const names = ["Beni", "Siti", "Alya", "Raka", "Dina"];
  const items = ["apel", "permen", "buku", "kelereng", "stiker"];

  if (variant === 0) {
    const a = (cycle % 9) + 1;
    const b = ((cycle * 2) % (10 - a)) + 1;
    return createMathEntry(
      `k1_add_${index + 1}`,
      "Kelas 1",
      "Penjumlahan 1-10",
      "Mudah",
      `${a} + ${b} = ?`,
      a + b,
      "Hitung maju dari angka pertama.",
      `${a} ditambah ${b} hasilnya ${a + b}.`
    );
  }

  if (variant === 1) {
    const answer = (cycle % 8) + 1;
    const removed = ((cycle * 3) % (10 - answer)) + 1;
    const start = answer + removed;
    return createMathEntry(
      `k1_sub_${index + 1}`,
      "Kelas 1",
      "Pengurangan 1-10",
      "Mudah",
      `${start} - ${removed} = ?`,
      answer,
      "Kurangi pelan-pelan dari angka pertama.",
      `${start} dikurangi ${removed} hasilnya ${answer}.`
    );
  }

  if (variant === 2) {
    const left = (cycle % 9) + 1;
    const right = ((cycle * 4) % 9) + 1;
    const larger = left === right ? left + 1 : Math.max(left, right);
    const smaller = left === right ? right : Math.min(left, right);
    return createMathEntry(
      `k1_compare_${index + 1}`,
      "Kelas 1",
      "Membandingkan Angka",
      "Mudah",
      `Angka yang lebih besar antara ${larger} dan ${smaller} adalah?`,
      larger,
      "Lihat angka mana yang nilainya paling banyak.",
      `Di antara ${larger} dan ${smaller}, yang lebih besar adalah ${larger}.`
    );
  }

  if (variant === 3) {
    const start = (cycle % 5) + 1;
    const step = (cycle % 3) + 1;
    const next = start + step * 4;
    return createMathEntry(
      `k1_pattern_${index + 1}`,
      "Kelas 1",
      "Pola Bilangan",
      "Mudah",
      `${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ... angka berikutnya adalah?`,
      next,
      "Cari berapa langkah penambahannya setiap kali.",
      `Polanya bertambah ${step}, jadi angka berikutnya adalah ${next}.`
    );
  }

  const first = (cycle % 5) + 1;
  const second = ((cycle * 2) % 5) + 1;
  const name = names[cycle % names.length];
  const item = items[cycle % items.length];
  return createMathEntry(
    `k1_story_${index + 1}`,
    "Kelas 1",
    "Soal Cerita",
    "Mudah",
    `${name} punya ${first} ${item}, lalu diberi ${second} ${item} lagi. Jumlah ${item} ${name} sekarang berapa?`,
    first + second,
    "Gabungkan jumlah benda pertama dan benda yang datang kemudian.",
    `${first} + ${second} = ${first + second}, jadi ${name} punya ${first + second} ${item}.`
  );
}

function generateClass2Entry(index) {
  const cycle = Math.floor(index / 5);
  const variant = index % 5;

  if (variant === 0) {
    const a = 12 + (cycle % 38);
    const b = 11 + ((cycle * 7) % 49);
    return createMathEntry(
      `k2_add_${index + 1}`,
      "Kelas 2",
      "Penjumlahan Dua Digit",
      "Sedang",
      `${a} + ${b} = ?`,
      a + b,
      "Jumlahkan satuan lalu puluhan.",
      `${a} ditambah ${b} sama dengan ${a + b}.`
    );
  }

  if (variant === 1) {
    const subtrahend = 10 + ((cycle * 5) % 40);
    const minuend = subtrahend + 10 + (cycle % 40);
    return createMathEntry(
      `k2_sub_${index + 1}`,
      "Kelas 2",
      "Pengurangan Dua Digit",
      "Sedang",
      `${minuend} - ${subtrahend} = ?`,
      minuend - subtrahend,
      "Kurangi bagian satuan lalu puluhan.",
      `${minuend} dikurangi ${subtrahend} hasilnya ${minuend - subtrahend}.`
    );
  }

  if (variant === 2) {
    const a = (cycle % 8) + 2;
    const b = ((cycle * 3) % 9) + 2;
    return createMathEntry(
      `k2_mul_${index + 1}`,
      "Kelas 2",
      "Perkalian Dasar",
      "Sedang",
      `${a} × ${b} = ?`,
      a * b,
      "Bayangkan ada beberapa kelompok dengan isi yang sama.",
      `${a} kali ${b} sama dengan ${a * b}.`
    );
  }

  if (variant === 3) {
    const start = (cycle % 10) + 1;
    const step = ((cycle * 2) % 5) + 2;
    const next = start + step * 4;
    return createMathEntry(
      `k2_pattern_${index + 1}`,
      "Kelas 2",
      "Pola Bilangan",
      "Sedang",
      `${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ... angka berikutnya adalah?`,
      next,
      "Perhatikan selisih tiap angka.",
      `Setiap langkah bertambah ${step}, jadi jawabannya ${next}.`
    );
  }

  const price = ((cycle % 9) + 2) * 1000;
  const qty = (cycle % 5) + 2;
  const total = price * qty;
  return createMathEntry(
    `k2_money_${index + 1}`,
    "Kelas 2",
    "Soal Cerita Uang",
    "Sedang",
    `Harga satu pensil Rp${price}. Jika membeli ${qty} pensil, berapa total uang yang dibutuhkan?`,
    total,
    "Kalikan harga satu benda dengan jumlah bendanya.",
    `${qty} × Rp${price} = Rp${total}.`
  );
}

function generateClass3Entry(index) {
  const cycle = Math.floor(index / 5);
  const variant = index % 5;

  if (variant === 0) {
    const a = 12 + (cycle % 19);
    const b = (cycle % 8) + 2;
    return createMathEntry(
      `k3_mul_${index + 1}`,
      "Kelas 3",
      "Perkalian",
      "Sedang",
      `${a} × ${b} = ?`,
      a * b,
      "Pisahkan puluhan dan satuan lalu kalikan.",
      `${a} kali ${b} hasilnya ${a * b}.`
    );
  }

  if (variant === 1) {
    const divisor = (cycle % 8) + 2;
    const quotient = ((cycle * 3) % 12) + 2;
    const dividend = divisor * quotient;
    return createMathEntry(
      `k3_div_${index + 1}`,
      "Kelas 3",
      "Pembagian Dasar",
      "Sedang",
      `${dividend} ÷ ${divisor} = ?`,
      quotient,
      "Cari angka yang jika dikali pembagi hasilnya bilangan awal.",
      `${dividend} dibagi ${divisor} sama dengan ${quotient}.`
    );
  }

  if (variant === 2) {
    const number = 100 + ((cycle * 37) % 900);
    const digitIndex = cycle % 3;
    const digit = String(number)[digitIndex];
    const place = digitIndex === 0 ? "ratusan" : digitIndex === 1 ? "puluhan" : "satuan";
    const value = digitIndex === 0 ? Number(digit) * 100 : digitIndex === 1 ? Number(digit) * 10 : Number(digit);
    return createMathEntry(
      `k3_place_${index + 1}`,
      "Kelas 3",
      "Nilai Tempat",
      "Sedang",
      `Pada angka ${number}, nilai digit ${digit} pada tempat ${place} adalah?`,
      value,
      "Lihat posisi digit pada ratusan, puluhan, atau satuan.",
      `Digit ${digit} berada di tempat ${place}, jadi nilainya ${value}.`
    );
  }

  if (variant === 3) {
    const length = (cycle % 20) + 4;
    const width = ((cycle * 3) % 15) + 3;
    const perimeter = 2 * (length + width);
    return createMathEntry(
      `k3_perimeter_${index + 1}`,
      "Kelas 3",
      "Keliling Persegi Panjang",
      "Sedang",
      `Persegi panjang dengan panjang ${length} cm dan lebar ${width} cm memiliki keliling berapa?`,
      perimeter,
      "Keliling persegi panjang adalah 2 × (panjang + lebar).",
      `2 × (${length} + ${width}) = ${perimeter}.`
    );
  }

  const boxes = (cycle % 7) + 3;
  const itemsPerBox = ((cycle * 2) % 8) + 4;
  return createMathEntry(
    `k3_story_${index + 1}`,
    "Kelas 3",
    "Soal Cerita",
    "Sedang",
    `Ada ${boxes} kotak, setiap kotak berisi ${itemsPerBox} buku. Jumlah semua buku ada berapa?`,
    boxes * itemsPerBox,
    "Gunakan perkalian jumlah kotak dan isi tiap kotak.",
    `${boxes} × ${itemsPerBox} = ${boxes * itemsPerBox}.`
  );
}

function generateClass4Entry(index) {
  const cycle = Math.floor(index / 5);
  const variant = index % 5;

  if (variant === 0) {
    const denominator = (cycle % 7) + 2;
    const left = (cycle % (denominator - 1)) + 1;
    const right = ((cycle * 2) % (denominator - left)) + 1;
    return createMathEntry(
      `k4_frac_add_${index + 1}`,
      "Kelas 4",
      "Pecahan",
      "Sedang",
      `${left}/${denominator} + ${right}/${denominator} = ?`,
      `${left + right}/${denominator}`,
      "Jika penyebut sama, jumlahkan pembilangnya.",
      `${left} + ${right} = ${left + right}, jadi hasilnya ${left + right}/${denominator}.`
    );
  }

  if (variant === 1) {
    const denominators = [4, 5, 6, 8];
    const leftDenominator = denominators[cycle % denominators.length];
    const rightDenominator = denominators[(cycle + 1) % denominators.length];
    const leftNumerator = (cycle % (leftDenominator - 1)) + 1;
    const rightNumerator = ((cycle * 2) % (rightDenominator - 1)) + 1;
    const leftValue = leftNumerator / leftDenominator;
    const rightValue = rightNumerator / rightDenominator;
    const answer = leftValue >= rightValue ? `${leftNumerator}/${leftDenominator}` : `${rightNumerator}/${rightDenominator}`;
    return createMathEntry(
      `k4_frac_compare_${index + 1}`,
      "Kelas 4",
      "Perbandingan Pecahan",
      "Sedang",
      `Pecahan yang lebih besar mana: ${leftNumerator}/${leftDenominator} atau ${rightNumerator}/${rightDenominator}?`,
      answer,
      "Bandingkan nilainya dengan gambar atau ubah ke desimal sederhana.",
      `Pecahan yang lebih besar adalah ${answer}.`
    );
  }

  if (variant === 2) {
    const length = (cycle % 18) + 4;
    const width = ((cycle * 2) % 12) + 3;
    const area = length * width;
    return createMathEntry(
      `k4_area_${index + 1}`,
      "Kelas 4",
      "Luas Bangun Datar",
      "Sedang",
      `Persegi panjang panjang ${length} cm dan lebar ${width} cm memiliki luas berapa?`,
      area,
      "Luas persegi panjang adalah panjang × lebar.",
      `${length} × ${width} = ${area} cm².`
    );
  }

  if (variant === 3) {
    const side = (cycle % 20) + 4;
    const perimeter = side * 4;
    return createMathEntry(
      `k4_perimeter_${index + 1}`,
      "Kelas 4",
      "Keliling",
      "Sedang",
      `Persegi dengan sisi ${side} cm memiliki keliling berapa?`,
      perimeter,
      "Keliling persegi adalah 4 × sisi.",
      `4 × ${side} = ${perimeter}.`
    );
  }

  const a = (cycle % 20) + 6;
  const b = ((cycle * 2) % 10) + 3;
  const c = (cycle % 5) + 2;
  const answer = a + b * c;
  return createMathEntry(
    `k4_mix_${index + 1}`,
    "Kelas 4",
    "Hitung Campuran",
    "Sulit",
    `${a} + ${b} × ${c} = ?`,
    answer,
    "Kerjakan perkalian lebih dulu, baru penjumlahan.",
    `${b} × ${c} = ${b * c}, lalu ${a} + ${b * c} = ${answer}.`
  );
}

function generateClass5Entry(index) {
  const cycle = Math.floor(index / 5);
  const variant = index % 5;

  if (variant === 0) {
    const left = ((cycle % 30) + 10) / 10;
    const right = (((cycle * 3) % 25) + 5) / 10;
    const answer = formatDecimal(left + right);
    return createMathEntry(
      `k5_decimal_${index + 1}`,
      "Kelas 5",
      "Desimal",
      "Sedang",
      `${formatDecimal(left)} + ${formatDecimal(right)} = ?`,
      answer,
      "Jumlahkan bagian satuan dan bagian desimalnya.",
      `${formatDecimal(left)} ditambah ${formatDecimal(right)} sama dengan ${answer}.`
    );
  }

  if (variant === 1) {
    const side = (cycle % 10) + 2;
    return createMathEntry(
      `k5_volume_${index + 1}`,
      "Kelas 5",
      "Volume Kubus",
      "Sedang",
      `Kubus dengan sisi ${side} cm memiliki volume berapa?`,
      side ** 3,
      "Volume kubus adalah sisi × sisi × sisi.",
      `${side} × ${side} × ${side} = ${side ** 3} cm³.`
    );
  }

  if (variant === 2) {
    const first = (cycle % 10) + 4;
    const second = ((cycle * 3) % 10) + 5;
    return createMathEntry(
      `k5_kpk_${index + 1}`,
      "Kelas 5",
      "KPK",
      "Sulit",
      `KPK dari ${first} dan ${second} adalah?`,
      lcm(first, second),
      "Tuliskan beberapa kelipatan dari kedua angka lalu cari yang sama paling kecil.",
      `KPK dari ${first} dan ${second} adalah ${lcm(first, second)}.`
    );
  }

  if (variant === 3) {
    const base = (cycle % 8) + 2;
    const first = base * ((cycle % 6) + 2);
    const second = base * (((cycle * 3) % 6) + 2);
    return createMathEntry(
      `k5_fpb_${index + 1}`,
      "Kelas 5",
      "FPB",
      "Sulit",
      `FPB dari ${first} dan ${second} adalah?`,
      gcd(first, second),
      "Cari faktor yang sama dan pilih yang terbesar.",
      `FPB dari ${first} dan ${second} adalah ${gcd(first, second)}.`
    );
  }

  const mapDistance = (cycle % 20) + 1;
  const scale = [100, 200, 500, 1000][cycle % 4];
  return createMathEntry(
    `k5_scale_${index + 1}`,
    "Kelas 5",
    "Skala",
    "Sulit",
    `Pada peta skala 1:${scale}, jarak ${mapDistance} cm di peta sama dengan berapa cm sebenarnya?`,
    mapDistance * scale,
    "Kalikan jarak di peta dengan penyebut skala.",
    `${mapDistance} × ${scale} = ${mapDistance * scale} cm.`
  );
}

function generateClass6Entry(index) {
  const cycle = Math.floor(index / 5);
  const variant = index % 5;

  if (variant === 0) {
    const percentages = [5, 10, 15, 20, 25, 40, 50, 75];
    const percent = percentages[cycle % percentages.length];
    const base = [100, 120, 160, 200, 240, 300, 400, 500][cycle % 8];
    return createMathEntry(
      `k6_percent_${index + 1}`,
      "Kelas 6",
      "Persen",
      "Sedang",
      `${percent}% dari ${base} = ?`,
      (percent / 100) * base,
      "Ubah persen ke pecahan atau desimal lalu kalikan.",
      `${percent}% dari ${base} adalah ${(percent / 100) * base}.`
    );
  }

  if (variant === 1) {
    const pairs = [
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [3, 5]
    ];
    const [leftUnit, rightUnit] = pairs[cycle % pairs.length];
    const factor = (cycle % 6) + 2;
    return createMathEntry(
      `k6_ratio_${index + 1}`,
      "Kelas 6",
      "Perbandingan",
      "Sedang",
      `Sederhanakan perbandingan ${leftUnit * factor} : ${rightUnit * factor}.`,
      `${leftUnit}:${rightUnit}`,
      "Bagi kedua angka dengan faktor yang sama paling besar.",
      `${leftUnit * factor} : ${rightUnit * factor} jika dibagi ${factor} menjadi ${leftUnit}:${rightUnit}.`
    );
  }

  if (variant === 2) {
    const time = (cycle % 5) + 2;
    const speed = ((cycle * 2) % 6) * 10 + 30;
    const distance = speed * time;
    return createMathEntry(
      `k6_speed_${index + 1}`,
      "Kelas 6",
      "Kecepatan",
      "Sulit",
      `Jarak ${distance} km ditempuh dalam ${time} jam. Kecepatannya berapa km/jam?`,
      speed,
      "Kecepatan = jarak ÷ waktu.",
      `${distance} ÷ ${time} = ${speed} km/jam.`
    );
  }

  if (variant === 3) {
    const first = (cycle % 20) + 60;
    const second = ((cycle * 2) % 20) + 70;
    const third = ((cycle * 3) % 20) + 80;
    const fourth = ((cycle * 4) % 20) + 90;
    const average = (first + second + third + fourth) / 4;
    return createMathEntry(
      `k6_average_${index + 1}`,
      "Kelas 6",
      "Rata-rata",
      "Sulit",
      `Nilai ${first}, ${second}, ${third}, dan ${fourth} memiliki rata-rata berapa?`,
      average,
      "Jumlahkan semua nilai lalu bagi banyaknya data.",
      `(${first} + ${second} + ${third} + ${fourth}) ÷ 4 = ${average}.`
    );
  }

  const solution = (cycle % 30) + 5;
  const addend = ((cycle * 2) % 20) + 3;
  return createMathEntry(
    `k6_algebra_${index + 1}`,
    "Kelas 6",
    "Aljabar Sederhana",
    "Sulit",
    `Jika x + ${addend} = ${solution + addend}, maka nilai x adalah?`,
    solution,
    "Pindahkan angka yang diketahui ke sisi lain dengan operasi kebalikan.",
    `x = ${solution + addend} - ${addend}, jadi x = ${solution}.`
  );
}

const gradeGenerators = [
  { grade: "Kelas 1", generate: generateClass1Entry },
  { grade: "Kelas 2", generate: generateClass2Entry },
  { grade: "Kelas 3", generate: generateClass3Entry },
  { grade: "Kelas 4", generate: generateClass4Entry },
  { grade: "Kelas 5", generate: generateClass5Entry },
  { grade: "Kelas 6", generate: generateClass6Entry }
];

function buildFullQuestionBank(entries) {
  const normalized = normalizeLearningEntries(entries);

  return gradeGenerators.flatMap(({ grade, generate }) => {
    const existing = normalized.filter((entry) => entry.grade === grade).slice(0, questionTargetPerGrade);
    const usedIds = new Set(existing.map((entry) => entry.id));
    const nextEntries = [...existing];
    let index = 0;

    while (nextEntries.length < questionTargetPerGrade) {
      const candidate = generate(index);
      if (!usedIds.has(candidate.id)) {
        nextEntries.push(candidate);
        usedIds.add(candidate.id);
      }
      index += 1;
    }

    return nextEntries;
  });
}

function hasCompleteQuestionBank(entries) {
  const normalized = normalizeLearningEntries(entries);
  return gradeGenerators.every(({ grade }) => normalized.filter((entry) => entry.grade === grade).length === questionTargetPerGrade);
}

function normalizeLearningEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry, index) => {
      const id = typeof entry?.id === "string" && entry.id.trim() ? entry.id.trim() : `math_${index + 1}`;
      return {
        id,
        grade: typeof entry?.grade === "string" ? entry.grade.trim() : "",
        topic: typeof entry?.topic === "string" ? entry.topic.trim() : "",
        level: typeof entry?.level === "string" ? entry.level.trim() : "",
        question: typeof entry?.question === "string" ? entry.question.trim() : "",
        answer: typeof entry?.answer === "string" ? entry.answer.trim() : "",
        hint: typeof entry?.hint === "string" ? entry.hint.trim() : "",
        explanation: typeof entry?.explanation === "string" ? entry.explanation.trim() : ""
      };
    })
    .filter((entry) => entry.grade && entry.topic && entry.question && entry.answer);
}

function readLearning() {
  ensureData();
  const raw = fs.readFileSync(learningFile, "utf-8");
  const parsed = JSON.parse(raw);
  const normalizedEntries = normalizeLearningEntries(parsed.entries);
  const fullEntries = buildFullQuestionBank(normalizedEntries);
  const next = {
    lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    entries: fullEntries
  };

  if (!hasCompleteQuestionBank(normalizedEntries)) {
    next.lastUpdated = new Date().toISOString();
    writeLearning(next);
  }

  return next;
}

function writeLearning(payload) {
  fs.writeFileSync(learningFile, JSON.stringify(payload, null, 2), "utf-8");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, passwordIterations, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const nextHash = crypto.pbkdf2Sync(password, salt, passwordIterations, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(nextHash, "hex"), Buffer.from(hash, "hex"));
}

function normalizeGrade(value) {
  if (typeof value !== "string") return "Kelas 1";
  const trimmed = value.trim();
  return /^Kelas [1-6]$/.test(trimmed) ? trimmed : "Kelas 1";
}

function readUsers() {
  ensureData();
  const raw = fs.readFileSync(usersFile, "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.users) ? parsed : { lastUpdated: new Date().toISOString(), users: [] };
}

function writeUsers(payload) {
  fs.writeFileSync(usersFile, JSON.stringify(payload, null, 2), "utf-8");
}

function readScores() {
  ensureData();
  const raw = fs.readFileSync(scoresFile, "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.scores) ? parsed : { lastUpdated: new Date().toISOString(), scores: [] };
}

function writeScores(payload) {
  fs.writeFileSync(scoresFile, JSON.stringify(payload, null, 2), "utf-8");
}

function createUserToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, name: user.name, grade: user.grade, role: "user" },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

function getAuthPayload(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, jwtSecret);
  } catch {
    return null;
  }
}

function userAuthMiddleware(req, res, next) {
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  req.user = payload;
  next();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    grade: user.grade,
    createdAt: user.createdAt
  };
}

function buildUserSummary(user) {
  const scoresPayload = readScores();
  const userScores = scoresPayload.scores
    .filter((item) => item.userId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  const examScores = userScores.filter((item) => item.mode === "exam");
  return {
    user: sanitizeUser(user),
    scores: userScores.slice(0, 20),
    stats: {
      attemptCount: userScores.length,
      examCount: examScores.length,
      bestScore: examScores.length > 0 ? Math.max(...examScores.map((item) => item.score)) : 0,
      averageScore: examScores.length > 0 ? Math.round(examScores.reduce((sum, item) => sum + item.score, 0) / examScores.length) : 0
    }
  };
}

function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ sub: adminUser, role: "admin" }, jwtSecret, { expiresIn: "2h" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

app.post("/api/users/register", (req, res) => {
  const { username, password, name, grade } = req.body || {};
  const safeUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
  const safePassword = typeof password === "string" ? password : "";
  const safeName = typeof name === "string" ? name.trim() : "";
  if (!safeUsername || safeUsername.length < 3) {
    return res.status(400).json({ error: "Username minimal 3 karakter." });
  }
  if (!safePassword || safePassword.length < 4) {
    return res.status(400).json({ error: "Password minimal 4 karakter." });
  }
  if (!safeName) {
    return res.status(400).json({ error: "Nama wajib diisi." });
  }

  const usersPayload = readUsers();
  if (usersPayload.users.some((item) => item.username === safeUsername)) {
    return res.status(409).json({ error: "Username sudah dipakai." });
  }

  const hashed = hashPassword(safePassword);
  const user = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    username: safeUsername,
    name: safeName,
    grade: normalizeGrade(grade),
    passwordHash: hashed.hash,
    passwordSalt: hashed.salt,
    createdAt: Date.now()
  };
  const next = {
    lastUpdated: new Date().toISOString(),
    users: [...usersPayload.users, user]
  };
  writeUsers(next);
  const token = createUserToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.post("/api/users/login", (req, res) => {
  const { username, password } = req.body || {};
  const safeUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
  const safePassword = typeof password === "string" ? password : "";
  const usersPayload = readUsers();
  const user = usersPayload.users.find((item) => item.username === safeUsername);
  if (!user || !verifyPassword(safePassword, user.passwordSalt, user.passwordHash)) {
    return res.status(401).json({ error: "Username atau password salah." });
  }
  const token = createUserToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.get("/api/users/me", userAuthMiddleware, (req, res) => {
  const usersPayload = readUsers();
  const user = usersPayload.users.find((item) => item.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "User tidak ditemukan." });
  res.json(buildUserSummary(user));
});

app.post("/api/users/scores", userAuthMiddleware, (req, res) => {
  const { mode, score, correct, total, grade, topic, stars } = req.body || {};
  if (mode !== "practice" && mode !== "exam") {
    return res.status(400).json({ error: "Mode tidak valid." });
  }
  const numericScore = Number(score);
  const numericCorrect = Number(correct);
  const numericTotal = Number(total);
  const numericStars = Number(stars);
  if (!Number.isFinite(numericScore) || !Number.isFinite(numericCorrect) || !Number.isFinite(numericTotal)) {
    return res.status(400).json({ error: "Nilai score tidak valid." });
  }

  const usersPayload = readUsers();
  const user = usersPayload.users.find((item) => item.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "User tidak ditemukan." });

  const scoresPayload = readScores();
  const scoreItem = {
    id: `score_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: user.id,
    userName: user.name,
    username: user.username,
    grade: normalizeGrade(grade || user.grade),
    topic: typeof topic === "string" && topic.trim() ? topic.trim() : "Semua",
    mode,
    score: Math.max(0, Math.min(100, Math.round(numericScore))),
    correct: Math.max(0, Math.round(numericCorrect)),
    total: Math.max(0, Math.round(numericTotal)),
    stars: Number.isFinite(numericStars) ? Math.max(1, Math.min(5, Math.round(numericStars))) : 1,
    createdAt: Date.now()
  };
  const next = {
    lastUpdated: new Date().toISOString(),
    scores: [scoreItem, ...scoresPayload.scores].slice(0, 5000)
  };
  writeScores(next);
  res.json({ ok: true, score: scoreItem });
});

app.get("/api/leaderboard", (req, res) => {
  const requestedGrade = normalizeGrade(req.query.grade);
  const scoresPayload = readScores();
  const examScores = scoresPayload.scores
    .filter((item) => item.mode === "exam" && item.grade === requestedGrade)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correct !== a.correct) return b.correct - a.correct;
      return a.createdAt - b.createdAt;
    });

  const bestPerUser = [];
  const seen = new Set();
  for (const item of examScores) {
    if (seen.has(item.userId)) continue;
    seen.add(item.userId);
    bestPerUser.push(item);
    if (bestPerUser.length >= 10) break;
  }

  res.json({
    grade: requestedGrade,
    entries: bestPerUser.map((item, index) => ({
      rank: index + 1,
      userName: item.userName,
      score: item.score,
      correct: item.correct,
      total: item.total,
      stars: item.stars,
      topic: item.topic,
      createdAt: item.createdAt
    }))
  });
});

app.get("/api/info", (req, res) => {
  try {
    const info = readInfo();
    res.json(info);
  } catch (e) {
    res.status(500).json({ error: "Gagal membaca data" });
  }
});

app.get("/api/learning", (req, res) => {
  try {
    const data = readLearning();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Gagal membaca data belajar" });
  }
});

app.put("/api/info", authMiddleware, (req, res) => {
  try {
    const current = readInfo();
    const body = req.body || {};
    const next = {
      name: typeof body.name === "string" ? body.name : current.name,
      description: typeof body.description === "string" ? body.description : current.description,
      coordinates: {
        lat: body.coordinates && typeof body.coordinates.lat === "number" ? body.coordinates.lat : current.coordinates.lat,
        lng: body.coordinates && typeof body.coordinates.lng === "number" ? body.coordinates.lng : current.coordinates.lng
      },
      mapsLink: typeof body.mapsLink === "string" ? body.mapsLink : current.mapsLink,
      address: typeof body.address === "string" ? body.address : current.address,
      hours: typeof body.hours === "object" && body.hours !== null ? body.hours : current.hours,
      contact: typeof body.contact === "object" && body.contact !== null ? body.contact : current.contact,
      socials: typeof body.socials === "object" && body.socials !== null ? body.socials : current.socials,
      products: Array.isArray(body.products) ? body.products : current.products,
      gallery: Array.isArray(body.gallery) ? body.gallery : current.gallery,
      highlights: Array.isArray(body.highlights) ? body.highlights : current.highlights,
      testimonials: Array.isArray(body.testimonials) ? body.testimonials : current.testimonials,
      lastUpdated: new Date().toISOString()
    };
    writeInfo(next);
    res.json(next);
  } catch (e) {
    res.status(500).json({ error: "Gagal menulis data" });
  }
});

app.put("/api/learning", authMiddleware, (req, res) => {
  try {
    const current = readLearning();
    const body = req.body || {};
    const nextEntries = Array.isArray(body.entries) ? normalizeLearningEntries(body.entries) : current.entries;
    const next = {
      lastUpdated: new Date().toISOString(),
      entries: nextEntries
    };
    writeLearning(next);
    res.json(next);
  } catch (e) {
    res.status(500).json({ error: "Gagal menulis data belajar" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend berjalan di http://localhost:${port}`);
});
