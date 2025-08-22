import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import Lecture from "../models/lecture.model.js";


export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;

    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category are required.",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: new mongoose.Types.ObjectId(req.id),
    });

    return res.status(201).json({
      course,
      message: "Course created.",
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    return res.status(500).json({
      message: "Failed to create course",
      error: error.message,
    });
  }
};

export const searchCourse = async(req,res) => {
  try {
    const {query="", categories=[],sortByPrice=""} = req.query;

    //create search query
    const searchCriteria = {
      isPublished:true,
      $or:[
        {courseTitle: {$regex:query, $options:"i"}},
        {subTitle: {$regex:query, $options:"i"}},
        {category: {$regex:query, $options:"i"}}
      ]
    }

    //if categories selected
    if(categories.length>0){
      searchCriteria.category = {$in : categories};
    }

    //define sorting order
    const sortOptions = {};
    if(sortByPrice === "low"){
      sortOptions.coursePrice = 1;
    }else if(sortByPrice === "high"){
      sortOptions.coursePrice = -1;
    }
    let courses = await Course.find(searchCriteria).populate({path:"creator", select:"name ,photoUrl"}).sort(sortOptions);
    return res.status(200).json({
      success:true,
      courses: courses || []
    })
  } catch (error) {
    console.log(error);
  }
}

export const getPublishedCourse = async(_,res) => {
  try {
    const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name"});
    if(!courses){
      return res.status(404).json({
        message:"Course not found"
      })
    }
    return res.status(200).json({
      courses
    })
  } catch (error) {
    console.error("Get published courses error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Course not found"
      })
    };
    return res.status(200).json({
      courses
    })

  } catch (error) {
    console.error("Create Course Error:", error);
    return res.status(500).json({
      message: "Failed to create course",
      error: error.message,
    });
  }
}

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
    const thumbnail = req.file;
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      })
    }
    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId); //Delete old thumbnail
      }
      courseThumbnail = await uploadMedia(thumbnail.path);
    }
    const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url };

    course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    return res.status(200).json({
      course,
      message: "Course updated successfully."
    })

  } catch (error) {
    console.error("Edit Course Error:", error.message, error.stack);
    return res.status(500).json({
      message: "Failed to Edit course",
      error: error.message,
    });
  }
}

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      })
    }
    return res.status(200).json({
      course
    })
  } catch (error) {
    console.error("Get Course by ID Error:", error.message, error.stack);
    return res.status(500).json({
      message: "Failed to Get course by ID",
      error: error.message,
    });
  }
}

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle, videoUrl, publicId, isPreviewFree } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !videoUrl || !publicId || isPreviewFree === undefined) {
      return res.status(400).json({ message: "Please provide all required lecture fields." });
    }

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is missing from request." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const newLecture = await Lecture.create({
      lectureTitle,
      videoUrl,
      publicId,
      isPreviewFree,
    });

    course.lectures.push(newLecture._id); // ✅ Only works if lectures field exists
    await course.save();

    return res.status(201).json({
      message: "Lecture created and added to course successfully.",
      lecture: newLecture,
    });
  } catch (error) {
    console.error("❌ Error creating lecture:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        message: "course not found"
      })
    }
    return res.status(200).json({
      lectures: course.lectures
    })
  } catch (error) {
    console.error("❌ Getting lecture:", error);
    return res.status(500).json(
      { message: "Internal server error." }
    );
  }
}

export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    const { courseId, lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found"
      })
    }
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
    lecture.isPreviewFree = isPreviewFree;
    await lecture.save();

    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    };
    return res.status(200).json({
      lecture,
      message: "Lecture updated successfullly"
    })
  } catch (error) {
    console.error("❌ Editing lecture error:", error);
    return res.status(500).json(
      { message: "Internal server error." }
    );
  }
}

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found"
      })
    }
    //Delete video from cloudinary
    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    //remove the lecture reference from associate course
    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    )
    return res.status(200).json({
      message: "Lecture removed successfully."
    })
  } catch (error) {
    console.error("❌ Removing lecture error:", error);
    return res.status(500).json(
      { message: "Internal server error." }
    );
  }
}

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found"
      })
    }
    return res.status(200).json({
      lecture
    })
  } catch (error) {
    console.error("❌ Getting lecture by Id error:", error);
    return res.status(500).json(
      { message: "Internal server error." }
    );
  }
}

//publish and unpublish course

export const togglePublishCourse = async(req,res) => {
  try {
    const {courseId} = req.params;
    const {publish} = req.query;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      })
    }
    course.isPublished = publish ==="true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({
      message:`Course is ${statusMessage}`
    })
  } catch (error) {
    console.error("❌ publish and unpublish error:", error);
    return res.status(500).json(
      { message: "Internal server error." }
    );
  }
}