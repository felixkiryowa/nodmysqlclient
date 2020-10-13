const connection = require("../connection");
const moment = require("moment");

module.exports = class AuthorController {
  static getAllAuthors(req, res) {
    const result = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM authors", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    return result
      .then((response) => {
        res.status(200).json({ data: response });
      })
      .catch((error) => {
        res.status(400).json({ errors: error });
      });
  }

  static getSingleAuthor(req, res) {
    const result = new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM authors WHERE id = ? ",
        [id],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
    return result
      .then((response) => {
        res.status(200).json({ data: response });
      })
      .catch((error) => {
        res.status(400).json({ errors: error });
      });
  }

  static createAuthor(req, res) {
    const author = { name: req.body.name, city: req.body.city };
    let result = new Promise((resolve, reject) => {
      connection.query("INSERT INTO authors SET ?", author, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    return result
      .then((response) => {
        res.status(201).json({ data: "Successfully created an author" });
      })
      .catch((error) => {
        res.status(400).json({ errors: error });
      });
  }

  static updateAuthor(req, res) {
    const id = req.params.id;
    const city = req.body.city;
    const result = new Promise((resolve, reject) => {
      connection.query(
        "UPDATE authors SET city = ? WHERE id = ?",
        [city, id],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
    return result
      .then((response) => {
        res.status(200).json({ data: "Successfully Updated an Author" });
      })
      .catch((error) => {
        res.status(400).json({ errors: error });
      });
  }

  static deleteAuthor(req, res) {
    const id = req.params.id;
    const result = new Promise((resolve, reject) => {
      connection.query("DELETE FROM authors WHERE id = ?", [id], (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    return result
      .then((response) => {
        res.status(200).json({ data: "Successfully deleted an author" });
      })
      .catch((error) => {
        res.status(400).json({ errors: error });
      });
  }

  static saveGenerateTimeSlots(
    numberOfTimeSlots,
    duration,
    startTimeString,
    insertDateId
  ) {
    // STORE AND KEEP TRACK OF LAST TIME IN GIVEN PERIOD. WE CAN THEN USE FOR NEXT TIME PERIOD TO BE GENERATED
    var lastTimeCalculated = [];
    const promises = [];
    for (let i = 0; i < numberOfTimeSlots; i++) {
      // SPLIT START TIME STRING TO OBTAIN THE FIRST 2 CHARACTERS E.G. 0 AND 1 NOT 0,1,2
      var splitStartTimeString = startTimeString.substring(0, 2);
      // CALCULATE END TIME OF FIRST TIME DURATION
      var endTime = parseInt(splitStartTimeString) + duration;
      // CHECK IF WE ARE RUNNING LOOP FOR FIRST TIME BY GETTING INDEX 0
      let promiseResult1 = new Promise((resolve, reject) => {
        if (i === 0) {
          // IF RESULT OF START TIME + END TIME <= 9, ADD ZERO IN FRONT OF RESULT,
          // ELSE DO NOTHING KEEP SAME (TERNERY OPERATOR). BECAUSE WE ACCOUNTING FOR SINGLE DIGITS TO HAVE 2
          // DIGITS WITH PRE ZERO AND AFTER 9 OK E.G. 10:00
          const timeRangeData = {
            work_date_id: insertDateId,
            from_time: parseInt(splitStartTimeString),
            end_time: endTime,
          };
          connection.query(
            "INSERT INTO work_hours SET ?",
            timeRangeData,
            (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            }
          );

          lastTimeCalculated.push(endTime);
        } else {
          // GET THE LAST TIME ADDED FROM LAST TIME CALCULATED ARRAY E.G. CAN USE POP() OR e.g. lastTimeCalcluated(i-1) for last index of array
          var lastSlotAdded = lastTimeCalculated.pop();
          // CALCULATE NEW END TIME SLOT BY ADDING LAST TIME IN LAST TIME CALCULATED ARRAY + DURATION E.G. 15 + 2 = 17
          var newTimeSlot = lastSlotAdded + duration;
          const timeRangeData2 = {
            work_date_id: insertDateId,
            from_time: lastSlotAdded,
            end_time: newTimeSlot,
          };

          connection.query(
            "INSERT INTO work_hours SET ?",
            timeRangeData2,
            (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            }
          );

          lastTimeCalculated.push(newTimeSlot);
        }
      });
      promises.push(promiseResult1);
    }

    return promises;
  }

  static getCreatedDateId(dateData) {
    let promise = new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO work_dates SET ?",
        dateData,
        (err, resp) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(resp);
          }
        }
      );
    });

    return promise;
  }

  static saveDatesAndTimes(dateAndTimeData) {
    let promise = new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO save_dates SET ?",
        dateAndTimeData,
        (err, resp) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(resp);
          }
        }
      );
    });

    return promise;
  }

  static createWorkDaysAndHours(req, res) {
    // CREATE START DATE STRING OF DATE RANGE
    var startDate = req.body.start_date;
    // CREATE END DATE STRING OF DATE RANGE
    var endDate = req.body.end_date;
    // DECLARE STRING OF THE START TIME IN TIME RANGE
    var startTimeString = req.body.start_time;
    // CONVERT THE START TIME STRING TO A MOMENT OBJECT FOR START TIME
    var startTime = moment(startTimeString, "HH:mm");
    // CONVERT THE END TIME STRING TO A MOMENT OBJECT FOR END TIME
    var endTime = moment(req.body.end_time, "HH:mm");
    // DURATION TO ENABLE US TO GENERATE DIFFERENT TIME PERIODS IN A GIVEN TIME RANGE
    var duration = req.body.duration;
    // GENERATE A MOMENT OBJECT CONSISTING OF THE TIME DIFFERENCE BETWEEN START TIME AND END TIME IN THE PROVIDED TIME RANGE (FROM - TO)
    var timeDifferenceObject = moment.duration(endTime.diff(startTime));
    // USE TIME DIFFERENCE OBJECT TO CALCULATE NUMBER OF HOURS BETWEEN TIME RANGE
    var hours = timeDifferenceObject.asHours();
    // CALCULATE THE NUMBER OF TIME SLOTS FROM THE GIVEN TIME RANGE WITH RESPECT TO PROVIDED DURATION E.G. IF HAVE 0900-1800, 2 HOUR DURATION, THEN 4 TIME SLOTS
    var numberOfTimeSlots = parseInt(hours / duration);

    // manipulate start date by 1 and convert to date object not string

    // date class created
    // class has constructor to pass string date to turn to date object
    // to instantiate new date object we need to pass a string date
    // if dont pass anything it will create todays date

    // CREATE START DATE OBJECT STRING USING NEW DATE() CLASS
    var startDateObject = new Date(startDate);
    // we need to add 1 to start date
    var dateArray = AuthorController.addDatesToArray(
      startDate,
      endDate,
      startDateObject
    );
    var timeArray = AuthorController.generateTimeSlots(
      numberOfTimeSlots,
      startTimeString,
      duration
    );

    // cant use forloop because dotn know start and end of loop. for while it will check if something still true then continues OR use if statement

    const savingDates = AuthorController.saveDatesAndTimes({
      list_dates: JSON.stringify(dateArray),
      list_times: JSON.stringify(timeArray),
    });

    savingDates
      .then((result) => {
        res.status(201).json({
          success: true,
          message: result,
          msg: "Succesfully added date range with respective time slots",
        });
      })
      .catch((error) => {
        res.status(400).json({ errors: error });
      });
  }

  static generateTimeSlots(numberOfTimeSlots, startTimeString, duration) {
    // STORE DIFFERENT TIME PERIODS WITHIN THE PROVIDED TIME RANGE WITH RESPECT TO DURATION
    var timeArray = [];
    // STORE AND KEEP TRACK OF LAST TIME IN GIVEN PERIOD. WE CAN THEN USE FOR NEXT TIME PERIOD TO BE GENERATED
    var lastTimeCalculated = [];
    // LOOP THORUGH THE NUMBER OF TIME SLOTS AND GENERATE THE CORRESPONDING NEW TIME SLOTS
    for (let i = 0; i < numberOfTimeSlots; i++) {
      // SPLIT START TIME STRING TO OBTAIN THE FIRST 2 CHARACTERS E.G. 0 AND 1 NOT 0,1,2
      var splitStartTimeString = startTimeString.substring(0, 2);
      // CALCULATE END TIME OF FIRST TIME DURATION
      var endTime = parseInt(splitStartTimeString) + duration;
      // CHECK IF WE ARE RUNNING LOOP FOR FIRST TIME BY GETTING INDEX 0
      if (i === 0) {
        // IF RESULT OF START TIME + END TIME <= 9, ADD ZERO IN FRONT OF RESULT, ELSE DO NOTHING KEEP SAME (TERNERY OPERATOR). BECAUSE WE ACCOUNTING FOR SINGLE DIGITS TO HAVE 2 DIGITS WITH PRE ZERO AND AFTER 9 OK E.G. 10:00
        var endTimeSlot =
          endTime <= 9
            ? "0" + endTime.toString() + ":00"
            : endTime.toString() + ":00";
        // PUSH GENERATED TIME SLOT TO TIME ARRAY
        timeArray.push(startTimeString + "-" + endTimeSlot);
        // UPDATE LAST TIME ARRAY WITH END TIME IN THE GENERATED TIME SLOT
        lastTimeCalculated.push(endTime);
      } else {
        // GET THE LAST TIME ADDED FROM LAST TIME CALCULATED ARRAY E.G. CAN USE POP() OR e.g. lastTimeCalcluated(i-1) for last index of array
        var lastSlotAdded = lastTimeCalculated.pop();
        // CALCULATE NEW END TIME SLOT BY ADDING LAST TIME IN LAST TIME CALCULATED ARRAY + DURATION E.G. 15 + 2 = 17
        var newTimeSlot = lastSlotAdded + duration;
        // PUSH THE GENERATED TIME SLOT IN THE TIME ARRAY
        timeArray.push(
          lastSlotAdded.toString() +
            ":00" +
            "-" +
            newTimeSlot.toString() +
            ":00"
        );
        // PUSH THE END TIME OF THE TIME SLOT GENERATED IN THE LAST TIME CALCULATED ARRAY
        lastTimeCalculated.push(newTimeSlot);
      }
    }

    return timeArray;
  }

  static addDatesToArray(startDate, endDate, startDateObject) {
    var dateArray = [];
    // WE LOOP THROUGH USING WHILE LOOP UNTIL CONDITION FALSE AS GENERATE DIFFERENT DATES WITHIN PROVIDED DATE RANGE
    while (startDate < endDate) {
      // CONVERT START DATE OBECT TO STRING DATE OBJECT
      var startDate = startDateObject.toISOString().slice(0, 10);
      // PUSH DATE STRING AFTER SLICING IT TO THE DATE ARRAY
      // PUSH DATE STRING AFTER SLICING IT TO THE DATE ARRAY
      dateArray.push(startDate);

      // GENERATE NEW DATE BY ADDING THE START DATE + 1.  WE INCREMENT THE START DATE BY 1 UNTIL END DATE
      startDateObject.setDate(startDateObject.getDate() + 1);
    }

    return dateArray;
  }

  static getAddDatesAndTimes(req, res) {
    let promise = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM save_dates", (err, resp) => {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
    });

    promise
      .then((result) => {
        res.status(200).json({ success: true, data: result });
      })
      .catch((error) => {
        res.status(400).json({ success: false, errors: error });
      });
  }
};
