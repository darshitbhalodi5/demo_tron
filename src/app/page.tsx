import Footer from "./components/Footer";
import Homepage from "./components/Homepage";
import Image from "next/image";
import img from "../app/assets/darkbg.png";

export default function Home() {
  return (
    <div>
      {/* <div className="w-full h-full absolute z-20">
        <Image src={img} alt="" className="w-full h-full" />
      </div> */}
      <div className="">
        <Homepage />
      </div>
    </div>
  );
}
