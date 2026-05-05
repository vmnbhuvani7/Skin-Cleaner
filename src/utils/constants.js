export const DEFAULT_PASSWORD = 'asdASD1!';

export const SPECIALIST_OPTIONS = [
    { label: "Dermatologist (Skin Specialist)", value: "Dermatologist (Skin Specialist)" },
    { label: "Trichologist (Hair Specialist)", value: "Trichologist (Hair Specialist)" },
    { label: "Dermatologist & Trichologist", value: "Dermatologist & Trichologist" },
    { label: "Cosmetologist", value: "Cosmetologist" },
    { label: "Other", value: "Other" }
];

export const DEFAULT_SERVICES = [
    {
        "id": 1,
        "title": "Skin Rejuvenation",
        "desc": "Reverse aging signs with chemical peels, micro-needling, and collagen boosters.",
        "icon": "Zap",
    },
    {
        "id": 2,
        "title": "Facial & Skin Care",
        "desc": "Deep cleansing and nourishing facials tailored to your unique skin concerns.",
        "icon": "Droplets",
    },
    {
        "id": 3,
        "title": "Hair Growth Therapy",
        "desc": "Medical-grade hair restoration treatments including PRP and growth factor injections.",
        "icon": "Scissors",
    },
    {
        "id": 4,
        "title": "Acne & Pimple Treatment",
        "desc": "Advanced dermatological protocols to clear active acne and prevent future breakouts.",
        "icon": "Smile",
    },
    {
        "id": 5,
        "title": "Laser Hair Removal",
        "desc": "Painless, high-precision laser technology for permanent hair reduction on all skin types.\n",
        "icon": "Heart",
    },
];

export const APPOINTMENT_STATUS_OPTIONS = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
];