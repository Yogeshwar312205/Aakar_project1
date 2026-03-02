import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';

function DownloadDropdown() {
    const [anchorEl, setAnchorEl] = useState(null);
    const menuRef = useRef(null);

    const handleClick = (event) => {
        if (anchorEl) {
            setAnchorEl(null);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (option) => {
        console.log(`Selected option: ${option}`);
        handleClose();
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target) && anchorEl) {
            handleClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [anchorEl]);

    return (
        <Box>
            <Button onClick={handleClick} variant="contained">
                Download
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                ref={menuRef}
            >
                <MenuItem onClick={() => handleMenuItemClick('excel')}>Excel</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('pdf')}>PDF</MenuItem>
            </Menu>
        </Box>
    );
}

export default DownloadDropdown;
