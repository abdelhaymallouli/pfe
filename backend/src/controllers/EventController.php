<?php
require_once __DIR__ . '/../models/EventModel.php';

class EventController {
    private $model;

    public function __construct($db) {
        $this->model = new EventModel($db);
    }

    public function getEvents() {
        return $this->model->getAllEvents();
    }

    public function addEvent($data) {
        // Basic validation can be added here if desired
        return $this->model->createEvent($data);
    }
}
?>
