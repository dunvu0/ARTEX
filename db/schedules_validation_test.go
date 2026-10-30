package db

import (
	"errors"
	"testing"
)

func TestScheduleValidationCodes(t *testing.T) {
	tests := []struct {
		code    string
		change  func(*TaskScheduleInput)
		message string
	}{
		{"nameRequired", func(v *TaskScheduleInput) { v.Name = " " }, "计划名称不能为空"},
		{"timezoneInvalid", func(v *TaskScheduleInput) { v.TimezoneMode = "other" }, "时区必须选择北京时间或系统当前时区"},
		{"typeInvalid", func(v *TaskScheduleInput) { v.ScheduleType = "other" }, "规则必须选择一次性或按周"},
		{"startTimeInvalid", func(v *TaskScheduleInput) { v.StartTime = "25:00" }, "开始时间格式不正确，请使用 HH:MM"},
		{"endTimeInvalid", func(v *TaskScheduleInput) { v.EndTime = "25:00" }, "结束时间格式不正确，请使用 HH:MM"},
		{"startDateInvalid", func(v *TaskScheduleInput) { v.ScheduleType = "once"; v.RunDate = "invalid" }, "开始日期格式不正确"},
		{"endDateInvalid", func(v *TaskScheduleInput) { v.ScheduleType = "once"; v.EndDate = "invalid" }, "截止日期格式不正确"},
		{"endDateBeforeStart", func(v *TaskScheduleInput) { v.ScheduleType = "once"; v.EndDate = "2026-10-29" }, "截止日期不能早于开始日期"},
		{"endTimeBeforeStart", func(v *TaskScheduleInput) { v.ScheduleType = "once"; v.EndDate = v.RunDate; v.EndTime = "01:00" }, "同一天的结束时间必须晚于开始时间"},
		{"weekdaysInvalid", func(v *TaskScheduleInput) { v.Weekdays = []int{1, 1} }, "星期选择必须为周一至周日且不能重复"},
		{"weekdaysRequired", func(v *TaskScheduleInput) { v.Weekdays = nil }, "按周计划至少选择一天"},
		{"taskIdsInvalid", func(v *TaskScheduleInput) { v.TaskIDs = []int64{0} }, "绑定任务编号无效或重复"},
		{"tooManyTasks", func(v *TaskScheduleInput) {
			for i := int64(1); i <= 101; i++ {
				v.TaskIDs = append(v.TaskIDs, i)
			}
		}, "最多选择100个任务"},
	}
	for _, tt := range tests {
		t.Run(tt.code, func(t *testing.T) {
			input := TaskScheduleInput{Name: "test", ScheduleType: "weekly", StartTime: "18:00", RunDate: "2026-10-30", Weekdays: []int{1}}
			tt.change(&input)
			_, err := normalizeScheduleInput(input)
			var validation *ScheduleValidationError
			if !errors.As(err, &validation) || validation.Code != "schedule."+tt.code || err.Error() != tt.message {
				t.Fatalf("unexpected validation: %#v", err)
			}
			if tt.code == "tooManyTasks" && validation.Params["limit"] != 100 {
				t.Fatalf("unexpected params: %#v", validation.Params)
			}
		})
	}
}

func TestScheduleNormalizationPreservesWindowSemantics(t *testing.T) {
	input := TaskScheduleInput{Name: " test ", ScheduleType: "weekly", StartTime: "23:00", EndTime: "01:00", Weekdays: []int{7, 1}, RunDate: "2026-10-30", EndDate: "2026-10-31"}
	normalized, err := normalizeScheduleInput(input)
	if err != nil {
		t.Fatal(err)
	}
	if normalized.Name != "test" || normalized.TimezoneMode != "beijing" || normalized.StartTime != "23:00" || normalized.EndTime != "01:00" || normalized.RunDate != "" || normalized.EndDate != "" || normalized.Weekdays[0] != 1 {
		t.Fatalf("unexpected normalization: %#v", normalized)
	}
	input.ScheduleType, input.EndTime = "once", "24:00"
	normalized, err = normalizeScheduleInput(input)
	if err != nil || normalized.EndDate != "2026-10-31" || normalized.EndTime != "24:00" || normalized.Weekdays != nil {
		t.Fatalf("unexpected one-time normalization: %#v, %v", normalized, err)
	}
}
