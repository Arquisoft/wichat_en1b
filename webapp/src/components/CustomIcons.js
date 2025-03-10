import * as React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export function SitemarkIcon() {

    return (
        <SvgIcon sx={{ height: 21, width: 160 }}>
            <svg
                width={160}
                height={21}
                viewBox="0 0 160 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Book icon (simple open book look) */}
                <path
                    d="M2 2h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H2V2Z"
                    fill="#4876EE"
                />
                <path
                    d="M14 2h6v10h-6a4 4 0 0 0-4 4V6a4 4 0 0 1 4-4Z"
                    fill="#00D3AB"
                />

                {/* Text "wichat_en1b" next to the book icon */}
                <text
                    x="24"
                    y="15"
                    fill="#4876EE"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                >
                    wichat_en1b
                </text>
            </svg>
        </SvgIcon>
    );
}