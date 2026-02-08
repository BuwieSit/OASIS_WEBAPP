import { StudentProfileScreen } from "../../layouts/profileScreen";
import Subtitle from "../../utilities/subtitle";
import Title from "../../utilities/title";
import { Info, SquarePen, Activity, BriefcaseBusiness } from "lucide-react";
import testPfp from "../../assets/testprofile.jpg";
import { useEffect, useState } from "react";
import api from "../../api/axios.jsx";
import { AnnounceButton } from "../../components/button";
import { FileUploadField, SingleField } from "../../components/fieldComp";

// ALWAYS RELIABLE BACKEND BASE URL
const API_BASE = api.defaults.baseURL;

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState("")
  const [ojtAdviser, setOjtAdviser] = useState("");
  const [program, setProgram] = useState("");
  const [password, setPassword] = useState("");

  const [photoPreview, setPhotoPreview] = useState(null);
  const normalizeName = (fullName) => {
    const parts = fullName
      .trim()
      .replace(/\s+/g, " ")
      .split(" ");

    if (parts.length === 1) {
      return {
        first_name: parts[0],
        middle_initial: "",
        last_name: "",
      };
    }

    if (parts.length === 2) {
      return {
        first_name: parts[0],
        middle_initial: "",
        last_name: parts[1],
      };
    }

    return {
      first_name: parts[0],
      middle_initial: parts[1][0].toUpperCase(),
      last_name: parts.slice(2).join(" "),
    };
  };

  const fetchProfile = async () => {
    const res = await api.get("/api/student/me");
    const fetchedProfile = res.data.profile;

    fetchedProfile.photo_url = fetchedProfile.photo_path
      ? `${API_BASE}${fetchedProfile.photo_path}`
      : null;

    setUser(res.data.user);
    setProfile(fetchedProfile);

    const fetchedFullName = `${fetchedProfile.first_name || ""} ${fetchedProfile.middle_initial || ""} ${fetchedProfile.last_name || ""}`;
    setFullName(fetchedFullName.trim());
    setOjtAdviser(fetchedProfile.ojt_adviser || "");
    setProgram(fetchedProfile.program || "");
  };

  useEffect(() => {
  fetchProfile();
  }, []);

  if (!user || !profile) return null;

  const displayFullname = `${profile.first_name || ""} ${profile.middle_initial || ""} ${profile.last_name || ""}`;

  const saveProfile = async () => {
  try {
    const { first_name, middle_initial, last_name } =
      normalizeName(fullName);

    const profileData = {
      first_name,
      middle_initial,
      last_name,
      ojt_adviser: ojtAdviser,
      program,
    };

    await api.patch("/api/student/me", profileData);

    await fetchProfile();
    await fetchProfile();

    setIsEditing(false);
    fetchProfile();
    alert("Profile updated successfully!");
  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.error || "Failed to update profile");
  }
};

  return (
    <StudentProfileScreen>
      <div className="bg-white p-5 max-w-[95%] w-[90%] border rounded-3xl grid grid-cols-2 gap-5 backdrop-blur-3xl">
      
        {/* ========== LEFT COLUMN ========== */}
        <div className="w-full h-auto p-3 flex flex-col gap-5 justify-start items-center">
          {/* Student Account (Read Only) */}
          <div className="w-full h-full text-center justify-center flex flex-col text-oasis-header font-oasis-text font-semibold text-2xl wrap-break-word">Student Account</div>          
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={photoPreview || profile.photo_url || testPfp}
              className="w-32 h-32 rounded-full object-cover object-center shadow-lg"
              alt="Profile"
              
            />
            
            {/* Edit Icon Button */}
            <label className="absolute bottom-0 right-0 bg-[#2d5f5d] text-white p-2 rounded-full cursor-pointer hover:bg-[#234948] shadow-md transition-colors">
              <SquarePen size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const previewUrl = URL.createObjectURL(file);
                  setPhotoPreview(previewUrl);

                  const formData = new FormData();
                  formData.append("photo", file);

                  try {
                    const res = await api.patch("/api/student/me/photo", formData);
                    setProfile((prev) => ({
                      ...prev,
                      photo_path: res.data.photo_path,
                      photo_url: `${API_BASE}${res.data.photo_path}`,
                    }));
                  } catch (err) {
                    alert(err?.response?.data?.error || "Photo upload failed");
                  }
                }}
              />
            </label>
          </div>

          {/* Email Display (Read Only) */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-semibold text-gray-600">Email</label>
            <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg break-all">
              {user.email}
            </div>
          </div>

          {/* User Activity Card */}
          <div className="w-full bg-[#2d5f5d] text-white p-4 rounded-2xl shadow-md">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Activity size={20} />
              User Activity
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="opacity-80">First access to site:</p>
                <p className="font-semibold">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ========== RIGHT COLUMN ========== */}
        <div className="w-full h-auto p-3 flex flex-col gap-5 justify-start items-start border-l pl-8">

          {/* Fullname na */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-semibold text-gray-600">Name</label>
            {isEditing ? (
                <input
                  type="text"
                  className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg border-none outline-none"                  
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  fieldHolder="Full Name"
                />
            ) : (
              <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg">
                {displayFullname || "—"}
              </div>
            )}
          </div>

          {/* OJT Adviser Field */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-semibold text-gray-600">OJT Adviser</label>
            {isEditing ? (
              
              <select 
                className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg border-none outline-none cursor-pointer"
                value={ojtAdviser}
                onChange={(e) => setOjtAdviser(e.target.value)}
              >
                <option value="">Select Adviser</option>
                <option value="Dr. Juan Dela Cruz">Dr. Juan Dela Cruz</option>
                <option value="Prof. Maria Santos">Prof. Maria Santos</option>
                <option value="Engr. Pedro Reyes">Engr. Pedro Reyes</option>
                <option value="Dr. Ana Garcia">Dr. Ana Garcia</option>
              </select>
            ) : (
              <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg">
                {profile.ojt_adviser || "Not assigned"}
              </div>
            )}  
          </div>

          {/* OJT Program Field */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-semibold text-gray-600">OJT Program</label>
            {isEditing ? (
              <select 
                className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg border-none outline-none cursor-pointer"
                value={program}
                onChange={(e) => setProgram(e.target.value)}>
                <option value="">Select Program</option>
                <option>DIT</option>
                <option>DLMOT</option>
                <option>DEET</option>
                <option>DMET</option>
                <option>DCvET</option>
                <option>DCpET</option>
                <option>DRET</option>
                <option>DECET</option>
              </select>
            ) : (
              <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg">
                {profile.program || "Not assigned"}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-semibold text-gray-600">Password</label>
            {isEditing ? (
              <input
                type="password"
                className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg border-none outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            ) : (
              <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg">
                **********
              </div>
            )}
          </div>
          
          {!isEditing ? (
            <div className="w-full flex justify-center gap-3 mt-4">
              <button 
                type="button"
                className="bg-[#2d5f5d] text-white px-8 py-2 rounded-lg hover:bg-[#234948] transition-colors font-semibold shadow-md"
                onClick={() => setIsEditing(true)}
              >
                Edit Details
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center gap-3 mt-4">
              <button 
                className="bg-gray-400 text-white px-8 py-2 rounded-lg hover:bg-gray-500 transition-colors font-semibold shadow-md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-[#2d5f5d] text-white px-8 py-2 rounded-lg hover:bg-[#234948] transition-colors font-semibold shadow-md"
                onClick={saveProfile}
              >
                Submit
              </button>
             
            </div>
          )}

        </div>

      </div>
    </StudentProfileScreen>
  );
}

export function SectionHeader({ icon, text }) {
  return (
    <div className="w-full p-2 flex items-center justify-center gap-1 relative backdrop-blur-3xl bg-oasis-blue shadow-[2px_2px_3px_rgba(0,0,0,0.5)]">
      {icon}
      <Subtitle text={text} size={"text-[1rem]"} />
    </div>
  );
}