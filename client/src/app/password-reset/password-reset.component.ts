import { Component, OnInit } from '@angular/core';
import { PasswordResetService } from "../../services/";
import { Params, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  public showSuccess: boolean = false;
  public showError: boolean = false;
  public showWarning: boolean = false;
  public password1: string = '';
  public password2: string = '';
  public warningMessage: string;
  public errorText: string;

  constructor(public activatedRoute: ActivatedRoute, public passwordResetService: PasswordResetService) { }

  ngOnInit() {
  }

  //https://leblum.io/reset-password?id=${id}
  saveNewPassword(){
    if(this.isPasswordValid()){
      this.activatedRoute.queryParamMap.subscribe((params: Params) => {
        let passwordResetTokenId = params.get('id');
        if(passwordResetTokenId){
          this.passwordResetService.resetPassword(passwordResetTokenId, this.password1).subscribe(
            (response) => {
              console.log(`response:${response}`);
              if (response.status === 200) {
                // Here we know it was successful.  So we're going to update the UI accordingly.
                this.showSuccess = true;
              }
            },
            (error) => {
              this.showError = true;
              this.errorText = JSON.stringify(error);
              throw (error);
            });
        }
        else{
          this.showError = true;
          this.errorText = JSON.stringify({message: "There was no id on the link supplied. Submit a new password reset request."});
        }
      });
    }
  }

  public isPasswordValid(): boolean{
    if(this.password1.length === 0 || this.password2.length === 0){
      this.showWarning = true;
      this.warningMessage = "You must enter a new password in both fields."
      return false;
    }

    // Now first we need to compare the 2 passwords.
    if(this.password1 !== this.password2){
      this.showWarning = true;
      this.warningMessage = "The two passwords don't match."
      return false;
    }

    // Now first we need to compare the 2 passwords.
    if(this.password1.length < 6){
      this.showWarning = true;
      this.warningMessage = "Password must be 6 characters."
      return false;
    }
    this.showWarning = false;
    return true;
  }
}
