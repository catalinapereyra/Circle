import React, { useEffect, useState } from "react";
import { useUserMode } from "../../contexts/UserModeContext.jsx";
import axiosInstance from "../../api/axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";
import './EditProfilePage.css';

function EditProfilePage() {
    const {mode} = useUserMode();
    const {mode: profileMode} = useParams();
    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState("");
    const [interest, setInterest] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [profilePicture, setProfilePicture] = useState(null); // archivo
    const [preview, setPreview] = useState(""); // base64 para previsualizar
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const endpoint = mode === "couple" ? "/profile/my-couple-profile" : "/profile/my-friendship-profile";
                const response = await axiosInstance.get(endpoint);
                setProfile(response.data);
                setBio(response.data.bio);
                setInterest(response.data.interest);
                if (response.data.profile_picture) {
                    setPreview(response.data.profile_picture); // mostrar imagen actual
                }
            } catch (error) {
                console.error("Error fetching your profile:", error);
                setMessage("Hubo un error al cargar tu perfil.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [mode]);

    const handleSaveChanges = async () => {
        if (!bio || !interest) {
            setMessage("Por favor, completa los campos de bio e intereses.");
            return;
        }

        const formData = new FormData();
        formData.append("bio", bio);
        formData.append("interest", interest);
        formData.append("mode", profileMode);

        // Si se seleccionó una nueva imagen (File), la mandamos
        if (profilePicture instanceof File) {
            formData.append("profile_picture", profilePicture);
        }

        try {
            const response = await axiosInstance.put("/profile/update-profile", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            if (response.data.message === "profile updated successfully") {
                navigate("/my-profile");
            } else {
                setMessage("Hubo un problema al guardar los cambios.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Hubo un error al guardar los cambios. Por favor, inténtalo de nuevo.");
        }
    };

    const handleBackClick = () => {
        navigate("/my-profile");
    };

    if (loading) return <p>Cargando perfil...</p>;

    return (
        <div style={{
            fontFamily: 'Space Grotesk, monospace',
            background: '#ffffff',
            border: '4px solid #000000',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            margin: '2rem auto',
            boxShadow: '8px 8px 0px #000000',
            transition: 'all 0.3s ease',
            position: 'relative'
        }}>
            <h2 style={{
                fontFamily: 'Space Grotesk, monospace',
                color: '#000000',
                fontSize: 'clamp(1.8rem, 6vw, 2.2rem)',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '2rem',
                lineHeight: '1',
                textAlign: 'center',
                borderBottom: '3px solid #000000',
                paddingBottom: '1.5rem'
            }}>
                Edit Profile ({profileMode === "couple" ? "Couple" : "Friendship"})
            </h2>

            <form onSubmit={(e) => e.preventDefault()} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                marginTop: '2rem'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <label style={{
                        fontWeight: '600',
                        color: '#000000',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.5rem'
                    }}>
                        Bio:
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write something about yourself"
                        style={{
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '3px solid #000000',
                            background: '#ffffff',
                            width: '100%',
                            boxSizing: 'border-box',
                            fontFamily: 'Space Grotesk, monospace',
                            fontWeight: '500',
                            color: '#000000',
                            transition: 'all 0.3s ease',
                            boxShadow: '4px 4px 0px #000000',
                            height: '120px',
                            resize: 'vertical'
                        }}
                        onFocus={(e) => {
                            e.target.style.outline = 'none';
                            e.target.style.background = '#000000';
                            e.target.style.color = '#ffffff';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '8px 8px 0px #000000';
                        }}
                        onBlur={(e) => {
                            e.target.style.background = '#ffffff';
                            e.target.style.color = '#000000';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '4px 4px 0px #000000';
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <label style={{
                        fontWeight: '600',
                        color: '#000000',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.5rem'
                    }}>
                        Intereses:
                    </label>
                    <input
                        type="text"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        placeholder="Tell us your interests"
                        style={{
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '3px solid #000000',
                            background: '#ffffff',
                            width: '100%',
                            boxSizing: 'border-box',
                            fontFamily: 'Space Grotesk, monospace',
                            fontWeight: '500',
                            color: '#000000',
                            transition: 'all 0.3s ease',
                            boxShadow: '4px 4px 0px #000000'
                        }}
                        onFocus={(e) => {
                            e.target.style.outline = 'none';
                            e.target.style.background = '#000000';
                            e.target.style.color = '#ffffff';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '8px 8px 0px #000000';
                        }}
                        onBlur={(e) => {
                            e.target.style.background = '#ffffff';
                            e.target.style.color = '#000000';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '4px 4px 0px #000000';
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <label style={{
                        fontWeight: '600',
                        color: '#000000',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.5rem'
                    }}>
                        Profile picture:
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setProfilePicture(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setPreview(reader.result);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                        style={{
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '3px solid #000000',
                            background: '#ffffff',
                            width: '100%',
                            boxSizing: 'border-box',
                            fontFamily: 'Space Grotesk, monospace',
                            fontWeight: '500',
                            color: '#000000',
                            transition: 'all 0.3s ease',
                            boxShadow: '4px 4px 0px #000000',
                            cursor: 'pointer'
                        }}
                    />
                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                marginTop: '1rem',
                                border: '3px solid #000000',
                                boxShadow: '4px 4px 0px #000000',
                                alignSelf: 'center'
                            }}
                        />
                    )}
                </div>

                {message && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        border: '3px solid #000000',
                        textAlign: 'center',
                        fontSize: '1rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '4px 4px 0px #000000',
                        fontFamily: 'Space Grotesk, monospace',
                        background: message.includes("éxito") ? '#ffffff' : '#000000',
                        color: message.includes("éxito") ? '#000000' : '#ffffff'
                    }}>
                        {message.includes("éxito") ? '✓ ' : '✕ '}{message}
                    </div>
                )}

                <button
                    className="save-button"
                    onClick={handleSaveChanges}
                    style={{
                        padding: '1rem 2rem',
                        background: '#000000',
                        color: '#ffffff',
                        border: '3px solid #000000',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginTop: '1.5rem',
                        width: '100%',
                        fontFamily: 'Space Grotesk, monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '8px 8px 0px #000000'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#ffffff';
                        e.target.style.color = '#000000';
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '12px 12px 0px #000000';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#000000';
                        e.target.style.color = '#ffffff';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '8px 8px 0px #000000';
                    }}
                    onMouseDown={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '4px 4px 0px #000000';
                    }}
                    onMouseUp={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '12px 12px 0px #000000';
                    }}
                >
                    Save Changes
                </button>

                <button
                    className="back-button"
                    onClick={handleBackClick}
                    style={{
                        padding: '1rem 2rem',
                        background: '#ffffff',
                        color: '#000000',
                        border: '3px solid #000000',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginTop: '1rem',
                        width: '100%',
                        fontFamily: 'Space Grotesk, monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '8px 8px 0px #000000'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#000000';
                        e.target.style.color = '#ffffff';
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '12px 12px 0px #000000';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#ffffff';
                        e.target.style.color = '#000000';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '8px 8px 0px #000000';
                    }}
                    onMouseDown={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '4px 4px 0px #000000';
                    }}
                    onMouseUp={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '12px 12px 0px #000000';
                    }}
                >
                    Back
                </button>
            </form>
        </div>
    );
}

export default EditProfilePage;