import { existsSync, readdir, readdirSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
  // json to js obj.
  const { HASH } = await req.json();

  const folderPath = path.join("public/big-files", HASH);

  let hasDir = {
    code: "1",
    msg: "断点续传",
    lastChunk: 0,
  };
  const notHavingDir = {
    code: "0",
    msg: "首次上传",
  };

  if (existsSync(folderPath)) {
    const lastChunk = readdirSync(folderPath, { withFileTypes: true }).length;
    hasDir["lastChunk"] = lastChunk;
    return NextResponse.json(hasDir);
  } else {
    return NextResponse.json(notHavingDir);
  }
}
