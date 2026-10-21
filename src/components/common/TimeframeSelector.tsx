import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DateRangeIcon from "@mui/icons-material/DateRange";

export type TimeframeType = "Weekly" | "Monthly" | "Yearly" | "Custom";

export interface TimeframeSelectorProps {
  value: TimeframeType;
  onChange: (timeframe: TimeframeType) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (startDate: string, endDate: string) => void;
  backgroundColor?: string;
  color?: string;
  size?: "small" | "medium";
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  value,
  onChange,
  customStartDate = "",
  customEndDate = "",
  onCustomDateChange,
  backgroundColor = "#045E6A",
  color = "#FFFFFF",
  size = "small",
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [tempStart, setTempStart] = useState(customStartDate);
  const [tempEnd, setTempEnd] = useState(customEndDate);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectOption = (option: TimeframeType) => {
    handleCloseMenu();
    if (option === "Custom") {
      setCustomDialogOpen(true);
    } else {
      onChange(option);
    }
  };

  const handleApplyCustomRange = () => {
    if (onCustomDateChange) {
      onCustomDateChange(tempStart, tempEnd);
    }
    onChange("Custom");
    setCustomDialogOpen(false);
  };

  const getLabel = () => {
    if (value === "Custom" && (customStartDate || customEndDate)) {
      if (customStartDate && customEndDate) {
        return `${customStartDate} - ${customEndDate}`;
      }
      return customStartDate ? `From ${customStartDate}` : `Until ${customEndDate}`;
    }
    return value;
  };

  return (
    <>
      <Button
        size={size}
        onClick={handleOpenMenu}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
        sx={{
          backgroundColor,
          color,
          borderRadius: "9999px",
          px: 2,
          py: size === "small" ? 0.5 : 0.8,
          fontSize: size === "small" ? "0.8rem" : "0.88rem",
          fontWeight: 700,
          textTransform: "none",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          "&:hover": {
            backgroundColor: "#034953",
            color: "#FFFFFF",
          },
        }}
      >
        {getLabel()}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
              mt: 0.5,
              minWidth: 150,
            },
          },
        }}
      >
        <MenuItem
          selected={value === "Weekly"}
          onClick={() => handleSelectOption("Weekly")}
          sx={{ fontWeight: value === "Weekly" ? 700 : 500 }}
        >
          Weekly
        </MenuItem>
        <MenuItem
          selected={value === "Monthly"}
          onClick={() => handleSelectOption("Monthly")}
          sx={{ fontWeight: value === "Monthly" ? 700 : 500 }}
        >
          Monthly
        </MenuItem>
        <MenuItem
          selected={value === "Yearly"}
          onClick={() => handleSelectOption("Yearly")}
          sx={{ fontWeight: value === "Yearly" ? 700 : 500 }}
        >
          Yearly
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          selected={value === "Custom"}
          onClick={() => handleSelectOption("Custom")}
          sx={{ fontWeight: value === "Custom" ? 700 : 500, color: "#2EBBD9", display: "flex", gap: 1 }}
        >
          <DateRangeIcon fontSize="small" /> Custom Range...
        </MenuItem>
      </Menu>

      {/* Custom Date Range Picker Dialog */}
      <Dialog
        open={customDialogOpen}
        onClose={() => setCustomDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "18px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
          <DateRangeIcon sx={{ color: "#045E6A" }} /> Select Custom Date Range
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
            Choose a start and end date to filter records.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={tempStart}
              onChange={(e) => setTempStart(e.target.value)}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={tempEnd}
              onChange={(e) => setTempEnd(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCustomDialogOpen(false)} sx={{ color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyCustomRange}
            sx={{
              backgroundColor: "#045E6A",
              color: "#FFFFFF",
              fontWeight: 700,
              borderRadius: "10px",
              px: 3,
              "&:hover": { backgroundColor: "#034953" },
            }}
          >
            Apply Range
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
