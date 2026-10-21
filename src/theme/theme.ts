import { createTheme } from "@mui/material/styles";

// ── NoSurgeries Brand Palette ──────────────────────────────────────────────
// Design system: White background, dark text, teal accent
//   Teal Dark   #045E6A  – primary brand teal
//   Teal Cyan   #2EBBD9  – vibrant accent
//   Text Dark   #111827  – primary text
//   Surface     #FFFFFF  – cards / dialogs
//   Canvas      #F8FAFC  – page background
// ──────────────────────────────────────────────────────────────────────────

export const BRAND = {
  tealDark:    "#045E6A",
  teal:        "#2EBBD9",
  tealLight:   "#DDF4F8",
  tealMid:     "#1CA7C0",
  textPrimary: "#111827",
  textSecond:  "#6B7280",
  white:       "#FFFFFF",
  canvas:      "#F8FAFC",
  border:      "#E2EDF2",

  // Kept for any pages still referencing BRAND.purple etc.
  purple:      "#5B2D8E",
  purpleLight: "#7c3aed",
  purpleDark:  "#3b1766",
  pink:        "#E82D7C",
  pinkLight:   "#f43f5e",
  cyan:        "#29C4E0",
  cyanLight:   "#67e8f9",
  navy:        "#1c2646",
  navyLight:   "#28355c",
  bgPage:      "#FFFFFF",
  bgCard:      "#FFFFFF",
  border_old:  "#E2EDF2",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: BRAND.tealDark,
      light: BRAND.teal,
      dark: "#034953",
      contrastText: "#ffffff",
    },
    secondary: {
      main: BRAND.teal,
      light: BRAND.tealLight,
      contrastText: "#045E6A",
    },
    info: {
      main: BRAND.teal,
      light: BRAND.tealLight,
      contrastText: "#045E6A",
    },
    background: {
      default: "#F8FAFC",
      paper:   "#FFFFFF",
    },
    text: {
      primary:   "#111827",
      secondary: "#6B7280",
    },
    divider: "rgba(4, 94, 106, 0.12)",
  },

  typography: {
    fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },

  shape: {
    borderRadius: 14,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F8FAFC",
          color: "#111827",
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        contained: ({ ownerState }) => ({
          fontWeight: 700,
          borderRadius: 10,
          textTransform: "none",
          ...(ownerState.color === "primary" && {
            backgroundColor: BRAND.tealDark,
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#034953",
              boxShadow: "0 4px 14px rgba(4, 94, 106, 0.35)",
            },
          }),
          ...(ownerState.color === "secondary" && {
            backgroundColor: BRAND.tealLight,
            color: BRAND.tealDark,
            "&:hover": {
              backgroundColor: "#C4EEF5",
            },
          }),
        }),
        outlined: {
          borderRadius: 10,
          textTransform: "none",
          borderColor: BRAND.teal,
          fontWeight: 600,
          color: BRAND.tealDark,
          transition: "all 0.25s ease",
          "&:hover": {
            borderColor: BRAND.tealDark,
            backgroundColor: BRAND.tealLight,
          },
        },
        text: {
          textTransform: "none",
          fontWeight: 600,
          color: BRAND.tealDark,
          "&:hover": {
            backgroundColor: BRAND.tealLight,
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: { size: "small" },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#6B7280",
          "&.Mui-focused": {
            color: BRAND.tealDark,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "#111827",
          backgroundColor: "#FFFFFF",
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E2EDF2",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: BRAND.teal,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: BRAND.tealDark,
            borderWidth: "2px",
          },
        },
        input: {
          "&::placeholder": {
            color: "#9CA3AF",
            opacity: 1,
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#6B7280",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#111827",
          "&:hover": {
            backgroundColor: BRAND.tealLight,
          },
          "&.Mui-selected": {
            backgroundColor: BRAND.tealLight,
            color: BRAND.tealDark,
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#C4EEF5",
            },
          },
        },
      },
    },

    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: BRAND.tealDark,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#E2EDF2",
          color: "#111827",
        },
        head: {
          backgroundColor: "#F8FAFC",
          color: "#374151",
          fontWeight: 700,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#F0FBFD",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#FFFFFF",
          color: "#111827",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#111827",
          boxShadow: "0 4px 16px rgba(4, 94, 106, 0.07)",
          border: "1px solid #E2EDF2",
          borderRadius: 18,
          transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
          "&:hover": {
            borderColor: BRAND.teal,
            boxShadow: "0 8px 24px rgba(46, 187, 217, 0.18)",
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#111827",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF",
          color: "#111827",
          borderRadius: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#111827",
          fontWeight: 800,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: "#6B7280",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        colorPrimary: {
          backgroundColor: BRAND.tealLight,
          color: BRAND.tealDark,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#111827",
          color: "#FFFFFF",
          borderRadius: 8,
          fontSize: "0.78rem",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E2EDF2",
        },
      },
    },
  },
});