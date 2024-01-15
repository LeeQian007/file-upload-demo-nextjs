import BigFileUpload from "@/components/BigFileUpload";
import SingleFileUpload from "@/components/SingleFileUpload";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <>
      <div className="flex items-center gap-2 justify-center">
        <h1>File upload Demo</h1>
        <ModeToggle />
      </div>
      <div className="flex md:flex-row flex-col">
        <SingleFileUpload />
        <BigFileUpload />
      </div>
    </>
  );
}
