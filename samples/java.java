package project1.ui;

import static project1.umethods.SleepTime.*;
import static project1.umethods.ScreenManipulation.*;

import java.util.Scanner;
import project1.ui.PatientMenu;
import project1.ui.DoctorMenu;
import project1.ui.authentication.AuthenticationMenu;

enum Months { //"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    JANUARY, FEBRUARY, MARCH, APRIL, MAY, JUNE,
	JULY, AUGUST, SEPTEMBER, OCTOBER, NOVEMBER, DECEMBER
}

/**
 * UIMenu
 */
public class UIMenu {

    //months is not a var, is a constant becuase of `final`
    public static final int year = 2021;

    public static void showMenu(){
        Scanner keyboard = new Scanner(System.in);
        int uResponse = 0;
        String test = "";

        do {
            System.out.printf("\t----Menu----\n\n");
            int time = 50;
            sleepText("1) Doctors", time); sleepText("2) Patient", time); sleepText("0) Exit", time);
            System.out.printf("\nType here 👉 ");

            do {
                try {
                    try {
                        test = keyboard.nextLine(); //receive whatever input
                        if (test.isEmpty()) {
                            throw new NullPointerException("var is empty");
                        } else {
                            sleepFor(500);
                            uResponse = Integer.parseInt(test); //parse that input into an Integer (not an int)
                            break;
                        }
                    } catch(NullPointerException e) {
                        System.out.printf("\nRemember you must type at least ony number from 0-2\n"); showMenu();
                    }
                } catch (NumberFormatException e) {
                    //TODO: handle exception
                    clearScreen();
                    System.out.printf("\n\nERROR (❌): this program only accepts integers\n\n");
                    showMenu();
                }
            } while (true);

            switch (uResponse) {
                case 0:
                    System.out.printf("Goodbye! Hope I helped!\n");
                    System.exit(0);
                    break;
                case 1:
                    clearScreen();
                    if (AuthenticationMenu.startAuthMenu(1) == true) { DoctorMenu.showDoctorMenu(); } else { System.out.printf("Something went wrong :)\n"); }
                    break;
                case 2:
                    clearScreen();
                    if (AuthenticationMenu.startAuthMenu(2) == true) { PatientMenu.showPatientMenu(); } else { System.out.printf("Something went wrong :)\n"); }
                    //PatientMenu.showPatientMenu();
                    break;
                default:
                    System.out.print("\033[H\033[2J"); System.out.flush();
                    System.out.printf("ERROR (❌): command not recognized\ntry again ↓\n");
            }
        } while (uResponse != 0);
    }
}
