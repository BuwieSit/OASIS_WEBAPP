import MainScreen from "../../layouts/mainScreen";
import Subtitle from "../../utilities/subtitle";
import { SquarePen, Activity, Eye, EyeClosed, User, Mail, ShieldCheck, GraduationCap, Calendar, X } from "lucide-react";
import testPfp from "../../assets/testprofile.png";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { SingleField } from "../../components/fieldComp";
import { GeneralPopupModal, ConfirmModal } from "../../components/popupModal";

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
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPhotoConfirm, setShowPhotoConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/student/me");
      const fetchedProfile = res.data.profile;

      fetchedProfile.photo_url = fetchedProfile.photo_path
        ? `${API_BASE}${fetchedProfile.photo_path}`
        : null;

      setUser(res.data.user);
      setProfile(fetchedProfile);
      setFirstName(fetchedProfile.first_name || "");
      setLastName(fetchedProfile.last_name || "");
      setMiddleInitial(fetchedProfile.middle_initial || "");
      setOjtAdviser(fetchedProfile.ojt_adviser || "");
      setProgram(fetchedProfile._program || "");
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user || !profile) return null;

  const displayFullname = `${profile.first_name || ""} ${profile.middle_initial ? profile.middle_initial + "." : ""} ${profile.last_name || ""}`;

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
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setErrMsg(err?.response?.data?.error || "Failed to update profile");
    }
  };

  const handlePhotoChange = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append("photo", selectedFile);
    
    try {
      const res = await api.patch("/api/student/me/photo", formData);
      setProfile((prev) => ({
        ...prev,
        photo_path: res.data.photo_path,
        photo_url: `${API_BASE}${res.data.photo_path}`,
      }));
      setSuccessMsg("Profile picture updated!");
      setPhotoPreview(null);
      setSelectedFile(null);
      setShowPhotoConfirm(false);
    } catch (err) {
      setErrMsg("Photo upload failed");
      setPhotoPreview(null);
      setSelectedFile(null);
      setShowPhotoConfirm(false);
    }
  };

  return (
    <MainScreen>
      {successMsg && (
        <GeneralPopupModal
          title="Success"
          text={successMsg}
          isSuccess={true}
          onClose={() => setSuccessMsg("")}
        />
      )}
      {errMsg && (
        <GeneralPopupModal
          title="Error"
          text={errMsg}
          isFailed={true}
          icon={<X color="#800020" size={35}/>}
          onClose={() => setErrMsg("")}
        />
      )}

      {showPhotoConfirm && (
        <ConfirmModal 
          confText="change your profile picture?"
          onConfirm={handlePhotoChange}
          onCancel={() => {
            setShowPhotoConfirm(false);
            setSelectedFile(null);
            setPhotoPreview(null);
          }}
        />
      )}

      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 animate__animated animate__fadeIn">
        
        {/* HERO SECTION / HEADER CARD */}
        <div className="relative bg-white rounded-[2.5rem] shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-oasis-header to-oasis-button-dark opacity-90"></div>
          
          <div className="relative pt-16 pb-8 px-8 flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Profile Image with Edit Overlay */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100">
                <img
                  src={photoPreview || profile.photo_url || testPfp}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt="Profile"
                />
              </div>
              
              <div className="absolute bottom-2 right-2 flex gap-2">
                <label className="bg-white text-oasis-header p-2.5 rounded-full cursor-pointer hover:bg-oasis-blue hover:text-white transition-all shadow-lg border border-gray-100" title="Upload Photo">
                  <SquarePen size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const previewUrl = URL.createObjectURL(file);
                      setPhotoPreview(previewUrl);
                      setSelectedFile(file);
                      setShowPhotoConfirm(true);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Name & Badge */}
            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 font-oasis-text">
                {displayFullname}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="bg-oasis-blue/30 text-oasis-button-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Student Account
                </span>
                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  PUP ITech
                </span>
              </div>
            </div>

            {/* Edit Trigger Button */}
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-oasis-header text-white px-8 py-3 rounded-2xl font-bold hover:bg-oasis-button-dark transition-all shadow-lg shadow-oasis-header/20 active:scale-95"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          
          {/* LEFT COLUMN: ACCOUNT INFO */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* EMAIL CARD */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4 text-oasis-header">
                <Mail size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Account Access</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Registered Email</p>
                <p className="font-bold text-gray-800 break-all">{user.email}</p>
              </div>
            </div>

            {/* ACTIVITY CARD */}
            <div className="bg-oasis-button-dark text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
              <Activity className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar size={20} className="text-oasis-blue" />
                  <span className="text-xs font-black uppercase tracking-widest text-oasis-blue">System Activity</span>
                </div>
                <p className="text-sm opacity-70 mb-1">First access to platform:</p>
                <p className="text-lg font-bold leading-tight">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium opacity-80">Account Secure & Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PROFILE FIELDS */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck size={24} className="text-oasis-header" />
                <h2 className="text-xl font-bold text-gray-800">Personal & Academic Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* NAME FIELDS */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 text-oasis-header mb-2">
                    <User size={16} />
                    <span className="text-[0.65rem] font-black uppercase tracking-tighter">Full Identity</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <SingleField labelText="First Name" fieldHolder="First name" onChange={(e) => setFirstName(e.target.value)} value={firstName} hasBorder />
                      <SingleField labelText="M.I." fieldHolder="M.I." onChange={(e) => setMiddleInitial(e.target.value.charAt(0).toUpperCase())} value={middleInitial} hasBorder />
                      <SingleField labelText="Last Name" fieldHolder="Last name" onChange={(e) => setLastName(e.target.value)} value={lastName} hasBorder />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ReadOnlyField label="First Name" value={firstName} />
                      <ReadOnlyField label="Middle Initial" value={middleInitial} />
                      <ReadOnlyField label="Last Name" value={lastName} />
                    </div>
                  )}
                </div>

                {/* ADVISER FIELD */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-oasis-header mb-2">
                    <GraduationCap size={16} />
                    <span className="text-[0.65rem] font-black uppercase tracking-tighter">OJT Mentor</span>
                  </div>
                  {isEditing ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 ml-1">Select Adviser</label>
                      <select 
                        className="w-full p-3.5 bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-oasis-header transition-all cursor-pointer"
                        value={ojtAdviser}
                        onChange={(e) => setOjtAdviser(e.target.value)}
                      >
                        <option value="">Select Adviser</option>
                        <option value="Dr. Juan Dela Cruz">Dr. Juan Dela Cruz</option>
                        <option value="Prof. Maria Santos">Prof. Maria Santos</option>
                        <option value="Engr. Pedro Reyes">Engr. Pedro Reyes</option>
                        <option value="Dr. Ana Garcia">Dr. Ana Garcia</option>
                      </select>
                    </div>
                  ) : (
                    <ReadOnlyField label="Current Adviser" value={ojtAdviser || "Not assigned"} />
                  )}
                </div>

                {/* PROGRAM FIELD */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-oasis-header mb-2">
                    <GraduationCap size={16} />
                    <span className="text-[0.65rem] font-black uppercase tracking-tighter">Academic Program</span>
                  </div>
                  {isEditing ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 ml-1">Select Program</label>
                      <select 
                        className="w-full p-3.5 bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-oasis-header transition-all cursor-pointer"
                        value={Program}
                        onChange={(e) => setProgram(e.target.value)}
                      >
                        <option value="">Select Program</option>
                        <option value="DIT">Diploma in Information Technology</option>
                        <option value="DEET">Diploma in Electrical Engineering</option>
                        <option value="DLMOT">Diploma in Legal Management Technology</option>
                        <option value="DCVET">Diploma in Civil Engineering</option>
                      </select>
                    </div>
                  ) : (
                    <ReadOnlyField label="Program / Course" value={Program || "Not assigned"} />
                  )}
                </div>

                {/* PASSWORD FIELD */}
                <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-oasis-header mb-2">
                    <ShieldCheck size={16} />
                    <span className="text-[0.65rem] font-black uppercase tracking-tighter">Security</span>
                  </div>
                  {isEditing ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 ml-1">New Password</label>
                      <div className="relative group">
                        <input
                          type={showPassword ? "text": "password"}
                          className="w-full p-3.5 bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-oasis-header transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Leave blank to keep current"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-oasis-header hover:text-oasis-button-dark transition-colors"
                        >
                          {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ReadOnlyField label="Account Password" value="••••••••••••" />
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 animate__animated animate__fadeInUp">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-10 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveProfile}
                    className="px-12 py-3 bg-oasis-header text-white rounded-2xl font-bold hover:bg-oasis-button-dark transition-all shadow-xl shadow-oasis-header/20 hover:scale-105 active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainScreen>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="space-y-1">
      <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="w-full p-3.5 bg-gray-50 text-gray-800 rounded-2xl border border-gray-100 font-medium">
        {value}
      </div>
    </div>
  );
}
