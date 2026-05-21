# MERN ફાઇનાન્સ ટ્રેકર (MERN Finance Tracker)

રિએક્ટ (React), એક્સપ્રેસ (Express), મોંગોડીબી (MongoDB), ટેલવિન્ડ CSS (Tailwind CSS), એક્સિઓસ (Axios), ચાર્ટ.js (Chart.js), ટોસ્ટ નોટિફિકેશન અને CSV/Excel નિકાસ સાથેનું એક સ્વચ્છ MERN સ્ટેક ફાઇનાન્સ ટ્રેકર.

## પ્રોજેક્ટ માળખું (Project Structure)

- `/client` – વાઇટ (Vite) અને ટેલવિન્ડ CSS (Tailwind CSS) વડે બનેલ રિએક્ટ ફ્રન્ટએન્ડ
- `/server` – મોંગોડીબી (MongoDB) અને મોંગૂસ (Mongoose) સાથેનું નોડ (Node) + એક્સપ્રેસ બેકએન્ડ

## સેટઅપ (Setup)

1. ક્લાયન્ટ અને સર્વર માટે ડિપેન્ડન્સીસ (dependencies) ઇન્સ્ટોલ કરો:

```bash
npm install --prefix client
npm install --prefix server
```

2. બેકએન્ડ પર્યાવરણ ગોઠવો (Configure backend environment):

```bash
cp server/.env.example server/.env
```

3. મોંગોડીબી (MongoDB) સ્થાનિક રીતે શરૂ કરો અથવા `server/.env` માં `MONGO_URI` અપડેટ કરો.

4. બંને એપ્સ એકસાથે શરૂ કરો:

```bash
npm run dev
```

5. ફ્રન્ટએન્ડને `http://localhost:5173` પર અને બેકએન્ડને `http://localhost:5000` પર બ્રાઉઝરમાં ખોલો.

## ઉપલબ્ધ કમાન્ડ્સ (Available commands)

- `npm run dev` – ક્લાયન્ટ અને સર્વર બંનેને એકસાથે રન કરો
- `npm run client` – રિએક્ટ એપને રન કરો
- `npm run server` – એક્સપ્રેસ API સર્વરને રન કરો
