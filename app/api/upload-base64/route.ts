import fs from "fs";
import path from "path";
import SparkMD5 from "spark-md5";
import { NextRequest, NextResponse } from "next/server";

type FileType = string | Buffer;

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const fileAndFileName = await req.formData();

  let file: FileType = fileAndFileName.get("file") as string;
  let fileName = fileAndFileName.get("fileName") as string;
  let spark = new SparkMD5.ArrayBuffer();
  let suffix = path.extname(fileName);
  file = decodeURIComponent(file);

  // remove prefix "data:image/png;base64,"
  file = file.replace(/^data:image\/\w+;base64,/, "");

  // get the binary of file
  file = Buffer.from(file, "base64");
  spark.append(file);

  const filePath = path.join("public", `${fileName}_${spark.end()}.${suffix}`);

  try {
    fs.writeFileSync(filePath, file);
    return new NextResponse("file uploaded successfully", { status: 200 }); // OK
  } catch (err) {
    return new NextResponse("file upload failed", { status: 400 });
  }
}
