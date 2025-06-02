<?php
// backend/src/controllers/EventController.php
require_once __DIR__ . '/../models/EventModel.php';

class EventController {
    private $model;

    public function __construct($db) {
        $this->model = new EventModel($db);
    }

    public function getEvents() {
        try {
            return $this->model->getAllEvents();
        } catch (Exception $e) {
            error_log("Error getting events: " . $e->getMessage());
            return [];
        }
    }

    public function getEventsByClientId(int $id_client) {
        try {
            return $this->model->getEventsByClientId($id_client);
        } catch (Exception $e) {
            error_log("Error getting events for client ID $id_client: " . $e->getMessage());
            return [];
        }
    }

    public function getEventById(int $id) {
        try {
            $event = $this->model->getEventById($id);
            if (!$event) {
                error_log("Event not found for ID: $id");
                return null;
            }
            return $event;
        } catch (Exception $e) {
            error_log("Error getting event ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function addEvent($data) {
        try {
            error_log("EventController::addEvent received data: " . json_encode($data));

            $required = ['id_client', 'title', 'id_type', 'event_date', 'location', 'expected_guests'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Field '$field' is required");
                }
            }

            if (!is_numeric($data['id_client'])) {
                throw new Exception('id_client must be numeric');
            }
            if (!is_numeric($data['id_type'])) {
                throw new Exception('id_type must be numeric');
            }
            if (!is_numeric($data['expected_guests'])) {
                throw new Exception('expected_guests must be numeric');
            }
            if (isset($data['budget']) && !is_numeric($data['budget'])) {
                throw new Exception('budget must be numeric');
            }
            if (isset($data['status']) && !in_array($data['status'], ['Planned', 'Ongoing', 'Completed', 'Cancelled'])) {
                throw new Exception('Invalid status value');
            }

            // Validate requests if provided
            if (isset($data['requests']) && is_array($data['requests'])) {
                foreach ($data['requests'] as $request) {
                    if (!isset($request['title']) || empty(trim($request['title']))) {
                        throw new Exception("Request title is required");
                    }
                    if (isset($request['amount']) && (!is_numeric($request['amount']) || $request['amount'] <= 0)) {
                        throw new Exception("Request amount must be a positive number");
                    }
                    if (isset($request['id_vendor']) && !is_numeric($request['id_vendor'])) {
                        throw new Exception("Request id_vendor must be numeric");
                    }
                    if (isset($request['deadline']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $request['deadline']) || !strtotime($request['deadline']))) {
                        throw new Exception("Invalid request deadline format, expected YYYY-MM-DD");
                    }
                    if (isset($request['status']) && !in_array($request['status'], ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                        throw new Exception("Invalid request status value");
                    }
                }
            }

            $eventId = $this->model->createEvent($data);
            if (!$eventId) {
                throw new Exception('Failed to create event - no ID returned');
            }

            error_log("Event created successfully with ID: $eventId");
            return $eventId;
        } catch (Exception $e) {
            error_log("Error adding event: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function updateEvent($data) {
        try {
            error_log("EventController::updateEvent received data: " . json_encode($data));

            if (!isset($data['id']) || !is_numeric($data['id'])) {
                throw new Exception("Event ID is required and must be numeric");
            }

            // Check if this is a status-only update
            if (array_keys($data) === ['id', 'status']) {
                if (!isset($data['status']) || empty(trim($data['status']))) {
                    throw new Exception("Status is required for status-only update");
                }
                if (!in_array($data['status'], ['Planned', 'Ongoing', 'Completed', 'Cancelled'])) {
                    throw new Exception("Invalid status value");
                }

                $this->model->updateEventStatus((int)$data['id'], $data['status']);
                error_log("Event status updated successfully with ID: " . $data['id']);
                return;
            }

            // Full update logic
            $existingEvent = $this->model->getEventById((int)$data['id']);
            if (!$existingEvent) {
                throw new Exception("Event not found");
            }

            $updateData = array_merge($existingEvent, $data);
            $updateData['banner_image'] = $data['banner_image'] ?? $existingEvent['banner_image'] ?? null;
            $updateData['status'] = in_array($data['status'] ?? $existingEvent['status'], ['Planned', 'Ongoing', 'Completed', 'Cancelled'])
                ? ($data['status'] ?? $existingEvent['status'])
                : 'Planned';

            if (isset($data['requests']) && is_array($data['requests'])) {
                foreach ($data['requests'] as $request) {
                    if (!isset($request['id_request']) || !is_numeric($request['id_request'])) {
                        throw new Exception("Request ID is required and must be numeric");
                    }
                    if (!isset($request['title']) || empty(trim($request['title']))) {
                        throw new Exception("Request title is required");
                    }
                    if (isset($request['amount']) && (!is_numeric($request['amount']) || $request['amount'] <= 0)) {
                        throw new Exception("Request amount must be a positive number");
                    }
                    if (isset($request['id_vendor']) && !is_numeric($request['id_vendor'])) {
                        throw new Exception("Request id_vendor must be numeric");
                    }
                    if (isset($request['deadline']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $request['deadline']) || !strtotime($request['deadline']))) {
                        throw new Exception("Invalid request deadline format, expected YYYY-MM-DD");
                    }
                    if (isset($request['status']) && !in_array($request['status'], ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                        throw new Exception("Invalid request status value");
                    }
                }
            }

            $this->model->updateEvent($updateData);
            error_log("Event updated successfully with ID: " . $data['id']);
        } catch (Exception $e) {
            error_log("Error updating event: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function deleteEvent(int $id) {
        try {
            $existingEvent = $this->model->getEventById($id);
            if (!$existingEvent) {
                throw new Exception("Event not found");
            }

            $this->model->deleteEvent($id);
            error_log("Event deleted successfully with ID: $id");
        } catch (Exception $e) {
            error_log("Error deleting event ID $id: " . $e->getMessage());
            throw $e;
        }
    }
}