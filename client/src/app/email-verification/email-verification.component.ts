import { Component, OnInit } from '@angular/core';
import { EmailVerificationService } from "../../services/";
import { Params, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { Constants } from "../constants";


@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {

  public showWorking: boolean = true;
  public showSuccess: boolean = false;
  public showError: boolean = false;
  public errorText: string = '';
  public secondsLeft: number = 10;

  //http://localhost:8080/verify-email?id=5987892ed2ee4c462845b242
  constructor(public activatedRoute: ActivatedRoute, public emailVerificationService: EmailVerificationService) { }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params: Params) => {
      let emailVerificationId = params.get('id');
      this.emailVerificationService.verifyEmail(emailVerificationId).subscribe(
        (response) => {
          console.log(`response:${response}`);
          if (response.status === 200) {
            // Here we know it was successful.  So we're going to update the UI accordingly.
            this.showSuccess = true;
            this.showWorking = false;

            this.CreateCounter();
          }
        },
        (error) => {
          this.showError = true;
          this.showWorking = false;
          this.errorText = JSON.stringify(error);
          throw (error);
        });
    });
  }

  public CreateCounter() {
    // Now we setup an interval, so that the ui can show the user that they'll be redirected.
    var interval = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) {
        clearInterval(interval);
        window.location.href = Constants.LeblumSiteLocation;
      }
    }, 1000);
  }
}
