# Mobile Card View Improvements

## Overview
The unit table has been enhanced with a mobile-friendly card view that automatically displays on devices with screen width of 768px or less.

## Key Improvements

### 1. **Enhanced Card Design**
- **Better Layout**: Cards now use a single-column layout for better readability
- **Improved Typography**: Larger, more readable fonts with proper contrast
- **Visual Hierarchy**: Clear separation between different information sections
- **Hover Effects**: Subtle animations and shadow effects for better user interaction

### 2. **Information Organization**
- **Header Section**: Unit ID and status prominently displayed
- **Field Layout**: Each piece of information (building, floor, area, price) in its own highlighted field
- **Price Emphasis**: Price information is highlighted with the primary color
- **Additional Details**: Extra information (like "dodatki") displayed in a separate highlighted section
- **Action Buttons**: Clear call-to-action buttons for viewing plans and contacting

### 3. **Mobile-Specific Features**
- **Responsive Design**: Cards adapt to different screen sizes (768px and 576px breakpoints)
- **Touch-Friendly**: Larger buttons and touch targets for mobile interaction
- **Sold Status**: Clear visual indication for sold units with a prominent badge
- **Optimized Spacing**: Proper padding and margins for mobile viewing

### 4. **Visual Enhancements**
- **Status Badges**: Color-coded status indicators
- **Card Shadows**: Subtle shadows for depth and visual separation
- **Border Accents**: Left border accent for additional information sections
- **Background Contrast**: Light gray backgrounds for better readability

## Technical Implementation

### CSS Changes
- Enhanced mobile media queries (768px and 576px)
- Improved card styling with better visual hierarchy
- Responsive grid layout for cards
- Touch-friendly button sizing and spacing

### JavaScript Updates
- Enhanced `renderCards()` function with better HTML structure
- Improved information organization in cards
- Better handling of optional data (plans, additional features)

## How to Test

1. **Desktop View**: Open the website on a desktop - you'll see the traditional table view
2. **Mobile View**: 
   - Resize your browser window to less than 768px width, OR
   - Open Developer Tools (F12) and toggle device simulation
   - The table will automatically hide and cards will appear
3. **Small Mobile**: Resize to less than 576px for optimized small screen layout

## Benefits

- **Better Readability**: Information is easier to scan and read on mobile devices
- **Improved UX**: Touch-friendly interface with clear call-to-actions
- **Visual Appeal**: Modern card design with proper visual hierarchy
- **Accessibility**: Better contrast and larger touch targets
- **Performance**: Optimized layout that works well on mobile devices

## File Structure
```
css/styles.css - Enhanced mobile card styles
js/app.js - Updated renderCards() function
index.html - Mobile cards container structure
```

The mobile card view now provides a much better user experience for mobile users, making it easy to browse and interact with apartment listings on smartphones and tablets.
