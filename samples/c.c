/*
 * BLOCK COMMENT
 */

#include <stdio.h>
#include <stdlib.h>

// Structure representing a rectangle
struct Rectangle {
    float length;
    float width;
};

// Structure representing a circle
struct Circle {
    float radius;
};

// Union to store either a rectangle or a circle
union ShapeUnion {
    struct Rectangle rectangle;
    struct Circle circle;
};

// Function to calculate the area of a rectangle
float calculateRectangleArea(struct Rectangle rect) {
    return rect.length * rect.width;
}

// Function to calculate the area of a circle
float calculateCircleArea(struct Circle circle) {
    return 3.14159 * circle.radius * circle.radius;
}

int main() {
    // Union to store either a rectangle or a circle
    union ShapeUnion myShape;

    // User input to choose shape
    int choice;
    printf("Enter 1 for Rectangle or 2 for Circle: ");
    scanf("%d", &choice);

    // Dynamically allocate memory based on user choice
    if (choice == 1) {
        // User chose rectangle
        myShape.rectangle.length = 5.0;
        myShape.rectangle.width = 3.0;
    } else if (choice == 2) {
        // User chose circle
        myShape.circle.radius = 4.0;
    } else {
        // Invalid choice
        printf("Invalid choice.\n");
        return 1;
    }

    // Calculate and display area based on user's choice
    if (choice == 1) {
        printf("Area of the rectangle: %.2f\n", calculateRectangleArea(myShape.rectangle));
    } else if (choice == 2) {
        printf("Area of the circle: %.2f\n", calculateCircleArea(myShape.circle));
    }

    // Dynamic memory allocation example
    int* dynamicArray = (int*)malloc(5 * sizeof(int));
    if (dynamicArray == NULL) {
        printf("Memory allocation failed.\n");
        return 1;
    }

    // Populate and display dynamic array
    printf("Dynamic Array: ");
    for (int i = 0; i < 5; i++) {
        dynamicArray[i] = i + 1;
        printf("%d ", dynamicArray[i]);
    }
    printf("\n");

    // Free dynamically allocated memory
    free(dynamicArray);

    return 0;
}
