import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { ArrowLeft, Loader } from "lucide-react";
import { Progress } from "@radix-ui/react-progress";
import { toast } from "sonner";
import axios from "axios";
import { useEditCourseMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/Features/api/courseApi";

const MEDIA_API = "http://localhost:3001/api/media";

const EditLecture = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const params = useParams();
  const { lectureId } = params;

  const [editLecture, { data, isLoading, error, isSuccess }] = useEditCourseMutation();
  const [removeLecture, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLectureMutation();
  const { data: lectureData } = useGetLectureByIdQuery(lectureId);

  const lecture = lectureData?.lecture;
  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree ?? false); 
      setUploadVideoInfo(lecture.videoInfo);
    }
  }, [lecture])

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total))
          }
        });
        if (res.data.success) {
          setUploadVideoInfo({ videoUrl: res.data.data.url, publicId: res.data.data.public_id })
          setBtnDisable(false);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  }

  const editLectureHandler = async () => {
    
    await editLecture({ lectureTitle, videoInfo: uploadVideoInfo, isPreviewFree: isFree, courseId, lectureId });
  }

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
    navigate(`/admin/course/${courseId}/lecture`);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error])

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
    }
  }, [removeSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-8 max-w-3xl mx-auto"
    >
      {/* Back Button and Heading */}
      <div className="flex items-center space-x-4 mb-8 ">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/course/${courseId}/lecture`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Update Your Lecture</h1>
      </div>

      {/* Card Section */}
      <Card className="shadow-xl dark:bg-gray-900">
        <CardContent className="space-y-5 p-5">
          <div>
            <h2 className="text-xl font-semibold">Edit Lecture</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Make changes and click save when done.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={removeLectureHandler}
            className="w-full"
            disabled={removeLoading}
          >
            {removeLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Removing...
              </div>
            ) : (
              "Remove Lecture"
            )}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Title</Label>
            <Input id="title" value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} placeholder="Enter lecture title..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video" className="text-base">
              Video <span className="text-red-500">*</span>
            </Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={fileChangeHandler}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <Label htmlFor="isFree" className="text-base">Is this lecture free to preview?</Label>
            <Switch
              id="isFree"
              checked={isFree}
              onCheckedChange={(checked) => setIsFree(checked)}
            />

          </div>

          {mediaProgress && (
            <div className="w-full max-w-md space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{uploadProgress}% uploaded</p>
            </div>
          )}

          <Button
            className="w-full mt-4"
            onClick={editLectureHandler}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Updating...
              </div>
            ) : (
              "Update Lecture"
            )}
          </Button>

        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EditLecture;
