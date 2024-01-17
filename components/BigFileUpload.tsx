"use client";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { instanceAxios } from "@/lib/axios-instance";
import SparkMD5 from "spark-md5";
import path from "path";
import axios from "axios";
import { Progress } from "./ui/progress";

type BufferPack = {
  buffer: ArrayBuffer;
  Hash: string;
  suffix: string;
  filename: string;
};
let CHUNK_SIZE = 100 * 1024;

const BigFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>("");
  const [isExisted, setIsExisted] = useState<boolean>(false);
  const [lastChunk, setLastChunk] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const changeBuffer = (file: File) => {
    return new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (ev) => {
        let buffer = ev.target?.result as ArrayBuffer;
        let spark = new SparkMD5.ArrayBuffer();
        spark.append(buffer);
        let Hash = spark.end();
        let suffix = path.extname(file.name);
        resolve({
          buffer,
          Hash,
          suffix,
          filename: `${Hash}.${suffix}`,
        });
      };
    });
  };

  const loadVideo = (file: File) => {
    return new Promise<HTMLVideoElement | null>((resolve, reject) => {
      const dataUrl = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.onloadeddata = function () {
          resolve(videoRef.current);
        };
        videoRef.current.onerror = function () {
          reject("video loaded failed.");
        };
        videoRef.current.setAttribute("preload", "auto");
        // get the first frame as the image of the video
        videoRef.current.src = dataUrl;
      }
    });
  };

  const handleChoose = () => {
    if (!uploadRef.current) {
      return null;
    }
    uploadRef.current.click();
  };

  const handleMove = () => {
    setFile(null);
    setHash("");
    setIsExisted(false);
    setLastChunk(0);
    setIsLoading(true);
    uploadRef.current!.value = "";
    videoRef.current!.src = "";
  };

  const handleChange = async () => {
    if (!uploadRef.current) {
      return null;
    }
    const file = uploadRef.current.files![0];
    setFile(file);

    try {
      const video = await loadVideo(file);
      let bufferPack = (await changeBuffer(file).then(
        (res) => res
      )) as BufferPack;
      let { Hash } = bufferPack;
      setHash(Hash);

      const res = await instanceAxios.post(
        "/api/upload-already",
        {
          HASH: Hash,
          fileName: file.name,
          fileType: file.type,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const { data } = res;
      setIsLoading(false);

      if (parseInt(data.code) === 1) {
        setIsExisted(true);
        setLastChunk(data.lastChunk);
      }

      if (data.lastChunk === 100) {
        toast.success("服务端已有文件，妙传！");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    // 500 chunk for 50 MB
    // count --> 560份
    let count = Math.ceil(file?.size / CHUNK_SIZE);

    let index = 0;
    let chunks = [];
    // 如果chunk大于100，就分成100块
    if (count > 100) {
      CHUNK_SIZE = file?.size / 100;
      count = 100;
    }

    while (index < count) {
      chunks.push({
        file: file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
        fileName: `${index + 1}_${file.name}`,
        folderName: hash,
        index: index,
      });
      index++;
    }

    if (isExisted) {
      if (!lastChunk) return;
      chunks = chunks.filter((item) => item.index > lastChunk - 1);
    }

    // 使用 Promise.all 处理多个异步请求
    const requests = chunks.map((chunk) => {
      let formData = new FormData();
      formData.append("file", chunk.file);
      formData.append("fileName", chunk.fileName);
      formData.append("folderName", chunk.folderName);
      formData.append("index", chunk.index.toString());

      return axios.post("/api/upload-chunk", formData).then((res) => {
        if (res.data.code === 1) {
          setLastChunk((lastChunk) => lastChunk + 1);
        }
      });
    });

    try {
      await Promise.all(requests);
      toast.success("上传成功", { position: "top-center" });
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };
  console.log("render");

  return (
    <div className="p-4 w-full md:w-[50%]">
      <h1 className="text-sky-600">
        Big Video File upload using 「SLICE + PROGRESSBAR」
      </h1>
      <div className="my-2">
        Feature:
        <li>
          after choose file, it will trigger a req to know how much is left to
          upload
        </li>
        <li>slice big files to small chunks</li>
        <li>max chunks is 100, each chunk will send a post request</li>
        <li>use promise all to trigger a toast</li>
        <li>update onprogress bar</li>
      </div>
      <div className="flex flex-col p-4 border-dotted border-4 rounded-lg min-h-[400px] h-auto">
        <div className="flex justify-between gap-4">
          <input
            type="file"
            className="hidden"
            ref={uploadRef}
            onChange={handleChange}
          />
          <Button onClick={handleChoose} className="flex-1">
            Choose File
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleUpload}
            className="flex-1"
          >
            Upload to The Server
          </Button>
        </div>

        <div>
          <video src="" ref={videoRef} className="py-4 rounded-lg"></video>
          {file && (
            <>
              <div className="flex flex-col">
                <div>
                  <Progress value={lastChunk} />
                </div>
                <div className="flex items-center gap-4 p-4">
                  <p>{file.name}</p>
                  <p>{(file.size / 1000000).toFixed(2)}MB</p>
                  <Button onClick={handleMove} variant="destructive">
                    Remove
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BigFileUpload;
