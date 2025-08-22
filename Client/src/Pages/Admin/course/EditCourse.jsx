import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "sonner";
import { useEditCourseMutation, useGetCourseByIdQuery, usePublishCourseMutation } from "@/Features/api/courseApi";

export default function EditCourse() {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId;
  const [publishCourse, { }] = usePublishCourseMutation();

  const [imagePreview, setImagePreview] = useState(null);
  const [input, setInput] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    courseLevel: "",
    price: "",
    courseThumbnail: null,
  });

  const { data: courseByIdData, isLoading: courseByIdLoading, refetch } = useGetCourseByIdQuery(courseId, { refetchOnMountOrArgChange: true });

  const course = courseByIdData?.course;

  useEffect(() => {
    if (course) {
      setInput({
        title: course.courseTitle,
        subtitle: course.subTitle,
        description: course.description,
        category: course.category,
        courseLevel: course.courseLevel,
        price: course.coursePrice,
        courseThumbnail: null
      })
    }
  }, [course])

  const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const selectCategory = (value) => {
    setInput((prev) => ({ ...prev, category: value }));
  };

  const selectCourseLevel = (value) => {
    setInput((prev) => ({ ...prev, courseLevel: value }));
  };

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => ({ ...prev, courseThumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const publishStatusHandler = async (action) => {
    try {
      const response = await publishCourse({ courseId, query: action });
      if (response.data) {
        refetch();
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to publish or unpublish course");
    }
  }


  const handleSave = async () => {
    const formData = new FormData();

    if (input.title) formData.append("courseTitle", input.title);
    if (input.subtitle) formData.append("subTitle", input.subtitle);
    if (input.description) formData.append("description", input.description);
    if (input.category) formData.append("category", input.category);
    if (input.courseLevel) formData.append("courseLevel", input.courseLevel);
    if (input.price) formData.append("coursePrice", input.price);
    if (input.courseThumbnail)
      formData.append("courseThumbnail", input.courseThumbnail);

    await editCourse({ formData, courseId });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Course updated");
      navigate("/admin/course"); // ✅ Redirect after success
    }
    if (error) {
      toast.error(error.data.message || "Failed to update course");
    }
  }, [isSuccess, error]);


  return (
    <motion.div
      className="p-5 md:p-10 space-y-6 text-gray-800 dark:text-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className=" flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">
          Add detailed information regarding the course
        </h1>
        <Button asChild>
          <Link to={`/admin/course/${courseId}/lecture`}>Go to Lecture Page</Link>
        </Button>
      </div>

      <Card className="shadow-lg dark:shadow-xl">
        <CardContent className="space-y-6 p-6">
          <p className="text-lg font-medium">
            Basic Information (Click save when you're done)
          </p>

          {course && (
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {course && (
                <div className="flex items-center space-x-2">
                  <Switch
                    disabled={course.lectures.length === 0}
                    checked={course.isPublished}
                    onCheckedChange={(checked) =>
                      publishStatusHandler(checked ? "true" : "false")
                    }
                    id="publish-toggle"
                  />
                  <Label htmlFor="publish-toggle">
                    {course.isPublished ? "Published" : "Unpublished"}
                  </Label>
                </div>
              )}

              <Button variant="destructive">Remove Course</Button>
            </div>
          )}


          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter course title"
              required
              value={input.title}
              onChange={changeEventHandler}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              name="subtitle"
              placeholder="Enter course subtitle (optional)"
              value={input.subtitle}
              onChange={changeEventHandler}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY || ""}
              value={input.description}
              onEditorChange={(newValue) =>
                setInput((prev) => ({ ...prev, description: newValue }))
              }
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic underline | " +
                  "alignleft aligncenter alignright alignjustify | " +
                  "bullist numlist outdent indent | removeformat | help",
              }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select onValueChange={selectCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="android">Android Development</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="ds">Data Science</SelectItem>
                  <SelectItem value="dsa">Data Structures & Algorithms</SelectItem>
                  <SelectItem value="git">Git and GitHub</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="uiux">UI/UX Design</SelectItem>
                  <SelectItem value="webdev">Web Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Course Level</Label>
              <Select onValueChange={selectCourseLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advance">Advance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Price (INR)</Label>
              <Input
                type="number"
                name="price"
                placeholder="Enter price"
                value={input.price}
                onChange={changeEventHandler}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Course Thumbnail</Label>
            <Input
              type="file"
              accept="image/*"
              id="thumbnail"
              onChange={selectThumbnail}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 rounded shadow-md mt-2"
              />
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate("/admin/course")}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
