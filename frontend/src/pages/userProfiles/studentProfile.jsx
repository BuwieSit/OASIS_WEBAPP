import { StudentProfileScreen } from "../../layouts/profileScreen";
import Subtitle from "../../utilities/subtitle";
import { Info, SquarePen, Activity, BriefcaseBusiness } from "lucide-react";
import testPfp from "../../assets/testprofile.jpg";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { AnnounceButton } from "../../components/button";
import { FileUploadField, SingleField } from "../../components/fieldComp";

const API_BASE = api.defaults.baseURL;

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [ojtAdviser, setOjtAdviser] = useState("");
  const [Program, setProgram] = useState("");
  const [password, setPassword] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
      async function fetchProfile() {
        const res = await api.get("/api/student/me");
        const fetchedProfile = res.data.profile;

        fetchedProfile.photo_url = fetchedProfile.photo_path
          ? `${API_BASE}${fetchedProfile.photo_path}`
          : null;

        const fetchedFullName = `${fetchedProfile.first_name || ""} ${fetchedProfile.middle_initial || ""} ${fetchedProfile.last_name || ""}`;
        
        setUser(res.data.user);
        setProfile(fetchedProfile);
        setFirstName(fetchedProfile.first_name || "");
        setLastName(fetchedProfile.last_name || "");
        setMiddleInitial(fetchedProfile.middle_initial || "");
        setFullName(fetchedFullName);
        setOjtAdviser(fetchedProfile.ojt_adviser || "");
        setProgram(fetchedProfile._program || "");
      }

    fetchProfile();
  }, []);

  if (!user || !profile) return null;

  const displayFullname = `${profile.first_name || "—"} 
                          ${profile.middle_initial || ""}
                          ${profile.last_name || ""}`;

  const saveProfile = async () => {
    try {
      const profileData = {
        first_name: firstName.trim(),
        middle_initial: middleInitial.trim().charAt(0).toUpperCase(),
        last_name: lastName.trim(),
        ojt_adviser: ojtAdviser,
        _program: Program,
    };

      if (password && password.trim() !== "") {
        profileData.password = password;
      }
      const response = await api.patch("/api/student/me", profileData);

       setProfile(prev => ({
          ...prev,
          ...response.data.profile   
      }));
      setPassword("");
      setIsEditing(false);
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Full error:", err); 
      console.error("Error response:", err?.response?.data); 
      alert(err?.response?.data?.error || "Failed to update profile");
    }
  };

  return (
    <StudentProfileScreen>
      <div className="bg-white p-5 max-w-[95%] w-[90%] border rounded-3xl grid grid-cols-2 gap-5 backdrop-blur-3xl">
      
        {/* ========== LEFT COLUMN ========== */}
        <div className="w-full h-auto p-3 flex flex-col gap-5 justify-start items-center">
          {/* Student Account (Read Only) */}
          <Subtitle text={displayFullname} size="text-[1.5rem]" color={"text-oasis-button-dark"} weight="font-bold"/>          
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

          {/* NAME */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-2">
                <label className="block mb-2 text-sm font-semibold text-gray-600">First name</label>
                <label className="block mb-2 text-sm font-semibold text-gray-600">Last name</label>
                <label className="block mb-2 text-sm font-semibold text-gray-600">Middle Initial</label>
            </div>

            {isEditing ? (
                <div className="w-full flex gap-5">
                  <SingleField
                    hasBorder={true}
                    fieldHolder={"First name"}
                    onChange={(e) => setFirstName(e.target.value)}
                    value={firstName}
                  />
                  <SingleField
                    hasBorder={true}
                    fieldHolder={"Last name"}
                    onChange={(e) => setLastName(e.target.value)}
                    value={lastName}
                  />
                  <SingleField
                    hasBorder={true}
                    fieldHolder={"Middle Initial"}
                    onChange={(e) => setMiddleInitial(e.target.value.charAt(0).toUpperCase())}
                    value={middleInitial}
                  />
                </div>


            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg">
                    {firstName || "-"}
                </div>
                <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg">
                    {lastName || "-"}
                </div>
                <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg">
                    {middleInitial || "-"}
                </div>
              </div>
              
            )}
          </div>

          {/* OJT Adviser Field */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-semibold text-gray-600">OJT Adviser</label>
            {isEditing ? (
              
              <select 
                className="w-full p-3 bg-white text-black border rounded outline-none cursor-pointer"
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
                {ojtAdviser || "Not assigned"}
              </div>
            )}  
          </div>

          {/* OJT Program Field */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-semibold text-gray-600">OJT Program</label>
            {isEditing ? (
              <select 
                className="w-full p-3 bg-white text-black border rounded outline-none cursor-pointer"
                value={Program}
                onChange={(e) => setProgram(e.target.value)}
              >
                <option value="">Select Program</option>
                <option value="DIT">Diploma in Information Technology</option>
                <option value="DEET">Diploma in Electrical Engineering</option>
                <option value="DLMOT">Diploma in Legal Management Technology</option>
                <option value="DCVET">Diploma in Civil Engineering</option>
              </select>
            ) : (
              <div className="w-full p-3 bg-[#2d5f5d] text-white rounded-lg">
                {Program || "Not assigned"}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-semibold text-gray-600">Password</label>
            {isEditing ? (
              <input
                type="password"
                className="w-full p-3 bg-white text-black border rounded outline-none"
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