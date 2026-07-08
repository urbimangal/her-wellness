const MenstrualCycle = require("../models/MenstrualCycle");
const { calculatePrediction } = require("../utils/dateUtils");

class MenstrualService {

    async saveCycle(userId, data) {

        const prediction = calculatePrediction(
            new Date(data.lastPeriodDate),
            data.cycleLength || 28
        );

        const cycle = await MenstrualCycle.create({

            user: userId,

            lastPeriodDate: data.lastPeriodDate,

            cycleLength: data.cycleLength || 28,

            periodLength: data.periodLength || 5,

            flow: data.flow || "Medium",

            symptoms: data.symptoms || [],

            mood: data.mood || "",

            notes: data.notes || "",

            predictedNextPeriod: prediction.nextPeriod,

            ovulationDate: prediction.ovulationDate,

            fertileWindowStart: prediction.fertileStart,

            fertileWindowEnd: prediction.fertileEnd,

        });

        return cycle;

    }

    async getPrediction(userId) {

        const cycle = await MenstrualCycle
            .findOne({ user: userId })
            .sort({ createdAt: -1 });

        if (!cycle) return null;

        return {

            nextPeriod: cycle.predictedNextPeriod,

            ovulationDate: cycle.ovulationDate,

            fertileWindow: {

                start: cycle.fertileWindowStart,

                end: cycle.fertileWindowEnd,

            }

        };

    }

    async getCalendar(userId) {

        const cycle = await MenstrualCycle
            .findOne({ user: userId })
            .sort({ createdAt: -1 });

        if (!cycle) return null;

        const periodDays = [];

        for (let i = 0; i < cycle.periodLength; i++) {

            const day = new Date(cycle.lastPeriodDate);

            day.setDate(day.getDate() + i);

            periodDays.push(day);

        }

        return {

            periodDays,

            nextPeriod: cycle.predictedNextPeriod,

            ovulationDate: cycle.ovulationDate,

            fertileWindow: {

                start: cycle.fertileWindowStart,

                end: cycle.fertileWindowEnd

            }

        };

    }

    async getHistory(userId) {

        return await MenstrualCycle.find({

            user: userId

        }).sort({

            createdAt: -1

        });

    }

    async updateCycle(id, userId, data) {

        const prediction = calculatePrediction(

            new Date(data.lastPeriodDate),

            data.cycleLength

        );

        return await MenstrualCycle.findOneAndUpdate(

            {

                _id: id,

                user: userId

            },

            {

                ...data,

                predictedNextPeriod: prediction.nextPeriod,

                ovulationDate: prediction.ovulationDate,

                fertileWindowStart: prediction.fertileStart,

                fertileWindowEnd: prediction.fertileEnd

            },

            {

                new: true

            }

        );

    }

    async deleteCycle(id, userId) {

        return await MenstrualCycle.findOneAndDelete({

            _id: id,

            user: userId

        });

    }

}

module.exports = new MenstrualService();