import { existsSync, mkdirSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const fileName = formData.get("fileName") as string;
  const file = formData.get("file") as File;
  const folderName = formData.get("folderName") as string;
  const index = formData.get("index") as string;

  const folderPath = path.join("public/big-files", folderName, fileName);
  const folderDir = path.join("public/big-files", folderName);

  const res = {
    index: index,
    msg: "write successfully",
    code: 1,
  };

  try {
    if (!existsSync(folderDir)) {
      mkdirSync(folderDir);
    }

    const fileBuffer = await file.arrayBuffer();
    writeFileSync(folderPath, Buffer.from(fileBuffer));
    return NextResponse.json(res);
  } catch (error) {
    console.log(error);
    return new NextResponse("hell no", { status: 400 });
  }
}
