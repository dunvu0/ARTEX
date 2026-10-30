package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Autumn-27/artex/db"
)

func TestCreateScheduleValidationResponse(t *testing.T) {
	s := &Server{m: &Manager{pg: &db.DB{}}}
	r := httptest.NewRequest("POST", "/api/schedules", strings.NewReader(`{"name":" ","schedule_type":"weekly"}`))
	w := httptest.NewRecorder()
	s.createSchedule(w, r)
	var payload struct {
		Error string `json:"error"`
		Code  string `json:"error_code"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	if w.Code != 400 || payload.Code != "schedule.nameRequired" || payload.Error != "计划名称不能为空" {
		t.Fatalf("unexpected HTTP response: %d %s", w.Code, w.Body)
	}
}

func TestScheduleErrorCompatibility(t *testing.T) {
	for _, coded := range []bool{false, true} {
		var err error = errors.New("raw storage detail")
		if coded {
			err = fmt.Errorf("validation: %w", &db.ScheduleValidationError{Code: "schedule.tooManyTasks", Message: "最多选择100个任务", Params: map[string]any{"limit": 100}})
		}
		recorder := httptest.NewRecorder()
		writeScheduleError(recorder, 400, err)
		var legacy struct {
			Error string `json:"error"`
		}
		if e := json.Unmarshal(recorder.Body.Bytes(), &legacy); e != nil {
			t.Fatal(e)
		}
		if recorder.Code != 400 || legacy.Error != err.Error() {
			t.Fatalf("legacy response changed: %s", recorder.Body)
		}
		var payload map[string]any
		if e := json.Unmarshal(recorder.Body.Bytes(), &payload); e != nil {
			t.Fatal(e)
		}
		if coded {
			if payload["error_code"] != "schedule.tooManyTasks" || payload["error_params"].(map[string]any)["limit"] != float64(100) {
				t.Fatalf("missing metadata: %#v", payload)
			}
		} else if len(payload) != 1 {
			t.Fatalf("raw error gained metadata: %#v", payload)
		}
	}
}
