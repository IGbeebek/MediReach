import amlodipineImage from "../assets/images/amlodipine_5mg.jpeg";
import amoxycillinImage from "../assets/images/amoxycillin_500mg.jpeg";
import atorvastatinImage from "../assets/images/atorvastatin.jpeg";
import azithromycinImage from "../assets/images/azithromycin_500mg.jpeg";
import celinImage from "../assets/images/Celin.jpeg";
import cetirizineImage from "../assets/images/cetrizine.jpeg";
import clotrimazoleImage from "../assets/images/clotrimazole.png";
import dextromethorphanImage from "../assets/images/dextromethorphan_syrup.jpeg";
import evionImage from "../assets/images/evion.jpeg";
import ibuprofenImage from "../assets/images/ibuprofen.jpeg";
import insulinImage from "../assets/images/insulin.jpeg";
import levocetirizineImage from "../assets/images/levocetirizine.jpeg";
import losartanImage from "../assets/images/losartan.jpeg";
import metforminImage from "../assets/images/metformin.jpeg";
import mupirocinImage from "../assets/images/mupirocin.jpeg";
import omeprazoleImage from "../assets/images/omeprazol.jpeg";
import orsImage from "../assets/images/ors.jpeg";
import pantoprazoleImage from "../assets/images/pantoprazol.jpeg";
import paracetamolImage from "../assets/images/paracetamol.jpeg";
import vitaminDImage from "../assets/images/vitaminD360K.jpeg";

const imageMap = {
  "amlodipine 5 mg": amlodipineImage,
  "amoxicillin 500 mg": amoxycillinImage,
  "azithromycin 500 mg": azithromycinImage,
  "cetirizine 10 mg": cetirizineImage,
  "clotrimazole cream 1 %": clotrimazoleImage,
  "ibuprofen 400 mg": ibuprofenImage,
  "metformin 500 mg": metforminImage,
  "omeprazole 20 mg": omeprazoleImage,
  "paracetamol 500 mg": paracetamolImage,
  "vitamin d3 60,000 iu": vitaminDImage,
  "celin 500 mg chewable tablet": celinImage,
  "evion 400 mg capsule": evionImage,
  "losartan 50 mg": losartanImage,
  "atorvastatin 10 mg": atorvastatinImage,
  "levocetirizine 5 mg": levocetirizineImage,
  "dextromethorphan syrup 100 ml": dextromethorphanImage,
  "pantoprazole 40 mg": pantoprazoleImage,
  "ors powder sachet": orsImage,
  "insulin glargine 100 iu/ml": insulinImage,
  "mupirocin ointment 2 %": mupirocinImage,
};

export function getMedicineImageUrl(medicineOrName, fallbackImageUrl = "") {
  const name = typeof medicineOrName === "string" ? medicineOrName : medicineOrName?.name;
  if (!name) return fallbackImageUrl;

  const normalizedName = String(name).trim().toLowerCase();
  return imageMap[normalizedName] || fallbackImageUrl;
}
