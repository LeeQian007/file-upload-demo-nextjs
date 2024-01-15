import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import SparkMD5 from "spark-md5";
import QueryString from "qs";
import { NextResponse } from "next/server";

type FileType = string | Buffer;

export async function POST(req: NextApiRequest) {
  if (req.method !== "POST") {
    return new NextResponse("Method Not Allowed", { status: 405 }); // Method Not Allowed
  }

  // obtain data
  let passedValue = await new Response(req.body).text();
  const fileAndFileName = QueryString.parse(passedValue);

  let file: FileType = fileAndFileName.file as string;
  let fileName = fileAndFileName.fileName as string;
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
    return new NextResponse("file upload failed", { status: 500 });
  }
}
