import { StudentProfileScreen } from "../../layouts/profileScreen";
import Subtitle from "../../utilities/subtitle";
import Title from "../../utilities/title";
import { Info, SquarePen, Activity, BriefcaseBusiness } from "lucide-react";
import testPfp from "../../assets/testprofile.jpg";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { AnnounceButton } from "../../components/button";
import { FileUploadField, SingleField } from "../../components/fieldComp";

// ✅ ALWAYS RELIABLE BACKEND BASE URL
const API_BASE = api.defaults.baseURL;

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");

  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const res = await api.get("/api/student/me");
      const fetchedProfile = res.data.profile;

      // ✅ NORMALIZE IMAGE URL ON FETCH
      fetchedProfile.photo_url = fetchedProfile.photo_path
        ? `${API_BASE}${fetchedProfile.photo_path}`
        : null;

      setUser(res.data.user);
      setProfile(fetchedProfile);

      setFirstName(fetchedProfile.first_name || "");
      setMiddleInitial(fetchedProfile.middle_initial || "");
      setLastName(fetchedProfile.last_name || "");
    }

    fetchProfile();
  }, []);

  if (!user || !profile) return null;

  const fullName = `${profile.first_name || ""} ${profile.middle_initial || ""} ${profile.last_name || ""}`.trim();

  const saveProfile = async () => {
    try {
      await api.patch("/api/student/me", {
        first_name: firstName,
        middle_initial: middleInitial,
        last_name: lastName,
      });

      setProfile((prev) => ({
        ...prev,
        first_name: firstName,
        middle_initial: middleInitial,
        last_name: lastName,
      }));

      setIsEditing(false);
    } catch {
      alert("Failed to update profile");
    }
  };

  return (
    <StudentProfileScreen>
      <div className="bg-white p-5 max-w-[95%] w-[90%] border rounded-3xl grid grid-cols-3 gap-5 bg-oasis-gradient shadow-[10px_10px_1px_rgba(0,0,0,0.5)] backdrop-blur-3xl">

        {/* PROFILE */}
        <div className="w-full h-auto p-3 flex flex-col gap-1 justify-center items-center">
          <img
            src={photoPreview || profile.photo_url || testPfp}
            className="w-40 aspect-square rounded-full object-cover object-center"
          />

          {isEditing && (
            <FileUploadField
              
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // ✅ Instant preview
                const previewUrl = URL.createObjectURL(file);
                setPhotoPreview(previewUrl);

                const formData = new FormData();
                formData.append("photo", file);

                try {
                  const res = await api.patch(
                    "/api/student/me/photo",
                    formData
                  );

                  // ✅ Persist ABSOLUTE URL
                  setProfile((prev) => ({
                    ...prev,
                    photo_path: res.data.photo_path,
                    photo_url: `${API_BASE}${res.data.photo_path}`,
                  }));
                } catch (err) {
                  alert(
                    err?.response?.data?.error ||
                    "Photo upload failed"
                  );
                }
              }}
            />
          )}

          {isEditing ? (
            <>
              <SingleField
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border-b outline-none"
                fieldHolder="First name"
              />
              <SingleField
                value={middleInitial}
                onChange={(e) => setMiddleInitial(e.target.value)}
                className="w-full border-b outline-none"
                fieldHolder="Middle initial"
              />
              <SingleField
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border-b outline-none"
                fieldHolder="Last name"
              />
            </>
          ) : (
            <Title text={fullName || "—"} isAnimated={false} />
          )}

          {isEditing && (
            <AnnounceButton
              btnText={"Save"}
              className="cursor-pointer"
              onClick={saveProfile}
            />
          )}
          <AnnounceButton
            btnText={isEditing ? "Cancel" : "Edit Profile"}
            className="cursor-pointer"
            onClick={() => setIsEditing(!isEditing)}
          />


        </div>

        {/* 2ND COLUMN */}
        <div className="w-full h-auto p-3 flex flex-col gap-5 justify-center items-center border-l">
          <section className="w-full flex flex-col gap-4">
            <SectionHeader text={"User Details"} icon={<Info/>} />

            <div className="grid grid-cols-2">
              <Subtitle text={"Full Name"} size="text-[0.8rem]"/>
              <Subtitle text={"Year"} size="text-[0.8rem]"/>

              <p className="font-oasis-text text-[0.9rem] font-bold">
                {fullName || "—"}
              </p>
              <p className="font-oasis-text text-[0.9rem] font-bold">
                {profile.year_level || "—"}
              </p>
            </div>

            <div>
              <Subtitle text={"PUP Webmail"} size="text-[0.8rem]"/>
              <p className="font-oasis-text text-[0.9rem] font-bold">
                {user.email}
              </p>
            </div>

            <div className="grid grid-cols-2 items-center justify-center">
              <Subtitle text={"Password"} size="text-[0.8rem]"/>
              {<SquarePen size={20}/>}
              <p className="font-oasis-text text-[0.9rem] font-bold">**********</p>
            </div>
          </section>

          <section className="w-full flex flex-col gap-4 mt-5">
            <SectionHeader text={"User Activity"} icon={<Activity size={20}/>} />
            <div className="w-full py-1 backdrop-blur-3xl rounded-2xl flex flex-col justify-center items-start gap-1">
              <Subtitle text={"First Access"} size="text-[0.8rem]"/>
              <p>{new Date(user.created_at).toLocaleString()}</p>
            </div>
          </section>
        </div>

        {/* 3RD COLUMN */}
        <div className="w-full h-auto p-3 flex flex-col gap-5 justify-start items-center">
          <section className="w-full flex flex-col gap-4">
            <SectionHeader text={"OJT Information"} icon={<Info size={20}/>}/>
          </section>
          
          <section className="w-full flex flex-col gap-4 mt-5">
            <SectionHeader text={"Host Training Establishment"} icon={<BriefcaseBusiness size={20}/>}/>
          </section>
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